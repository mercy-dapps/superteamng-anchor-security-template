use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct TransferSpl<'info> {
    pub from: Signer<'info>,

    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub to_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl<'info> TransferSpl<'info> {
    pub fn transfer_token(&self, amount: u64) -> Result<()> {

        let cpi_accounts = Transfer {
            from: self.from_ata.to_account_info(),
            to: self.to_ata.to_account_info(),
            authority: self.from.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }
}  