use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

#[derive(Accounts)]
pub struct MintTokenVulnerable<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    // No authorization constraint on mint authority
    #[account(
        mut,
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

impl<'info> MintTokenVulnerable<'info> {

    pub fn mint_token_vulnerable(&self, amount: u64) -> Result<()> {

       // Missing authorization check here 
       // No custom error handling for unauthorized access making it difficult to debug

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