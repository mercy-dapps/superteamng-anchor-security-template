use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

use crate::error::SplTokenError;

#[derive(Accounts)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    // Adding constraint to ensure only mint authority can mint tokens
    #[account(
        mut,
        constraint = new_mint.mint_authority.contains(&signer.key()) @ SplTokenError::Unauthorized
    )]
    pub new_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = signer,
        associated_token::mint = new_mint,
        associated_token::authority = signer,
    )]
    pub new_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> MintToken<'info> {

    pub fn mint_token(&self, amount: u64) -> Result<()> {

        // Verify that the signer is the mint authority
        let mint_authority = self.new_mint.mint_authority
            .ok_or(SplTokenError::Unauthorized)?; 

        require_keys_eq!(
            mint_authority,
            self.signer.key(),
            SplTokenError::Unauthorized
        );
        // additional check above ensuring custom error is thrown
        // It is essential to verify authorization checks and not. oonly rely on program constraints thereby ensuring all vulnerabilities are covered.

    let mint_to_instruction = MintTo {
        mint: self.new_mint.to_account_info(),
        to: self.new_ata.to_account_info(),
        authority: self.signer.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), mint_to_instruction);
    token::mint_to(cpi_ctx, amount)?;

    Ok(())
    }
}