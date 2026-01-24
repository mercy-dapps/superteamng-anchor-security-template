use anchor_lang::prelude::*;

use anchor_spl::token::{ Mint, Token};

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        mint::decimals = 9,
        mint::authority = signer,
        mint::freeze_authority = signer,

        seeds = [b"my_mint", signer.key().as_ref()],
        bump,
    )]
    pub new_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateToken<'info> {

    pub fn create_token(&self) -> Result<()> {
    msg!("Token created: {}", self.new_mint.key());

    Ok(())
    }
}