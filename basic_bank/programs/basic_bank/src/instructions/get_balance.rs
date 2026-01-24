use anchor_lang::prelude::*;

pub use crate::{error::*, state::*};

#[derive(Accounts)]
pub struct GetBalance<'info> {
    pub bank: Account<'info, Bank>,

    #[account(
        seeds = [b"user_account", user.key().as_ref()],
        bump,
        constraint = user_account.owner == user.key() @BankError::UnauthorizedAccess
    )]
    pub user_account: Account<'info, UserAccount>,

    pub user: Signer<'info>,
}

impl<'info> GetBalance<'info> {
    pub fn get_balance(&self) -> Result<u64> {
        let user_account = &self.user_account;
        let balance = user_account.balance;

        msg!("Balance for {}: {} lamports", user_account.owner, balance);

        Ok(balance)
    }
}