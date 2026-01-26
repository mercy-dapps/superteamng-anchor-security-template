use anchor_lang::prelude::*;

pub use crate::{error::*, state::*};

#[derive(Accounts)]
pub struct GetBalance<'info> {
    pub bank: Account<'info, Bank>,

    #[account(
        seeds = [b"user_account", user.key().as_ref()],
        bump,
     )]
    pub user_account: Account<'info, UserAccount>,

    pub user: Signer<'info>,
}

impl<'info> GetBalance<'info> {
    pub fn get_balance(&self) -> Result<u64> {
        // custom/additional check ensuring only owner account can check balance
        require!(self.user_account.owner == self.user.key(), BankError::UnauthorizedAccess);

        let user_account = &self.user_account;
        let balance = user_account.balance;

        msg!("Balance for {}: {} lamports", user_account.owner, balance);

        Ok(balance)
    }
}