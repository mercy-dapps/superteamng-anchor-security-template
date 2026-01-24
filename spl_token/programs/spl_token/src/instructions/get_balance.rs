use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount};

#[derive(Accounts)]
pub struct GetBalance<'info> {
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
}

impl<'info> GetBalance<'info> {
    pub fn get_balance(&self) -> Result<()> {
        msg!("Token Account Address: {}", self.token_account.key());
        msg!("Token Account Owner: {}", self.token_account.owner);
        msg!("Token Account Balance: {}", self.token_account.amount);
        
        Ok(())
    }
}