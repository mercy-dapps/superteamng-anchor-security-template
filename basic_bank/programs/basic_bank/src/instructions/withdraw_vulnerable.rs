use anchor_lang::prelude::*;
pub use crate::{error::*, state::*};

#[derive(Accounts)]
pub struct WithdrawVulnerable<'info> {
    #[account(mut)]
    pub bank: Account<'info, Bank>,

    #[account(
        mut,
        seeds = [b"user_account", user.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>
}

impl<'info> WithdrawVulnerable<'info> {
    pub fn withdraw_vulnerable(&mut self, amount: u64) -> Result<()> {

        let bank = &mut self.bank;
        let user_account = &mut self.user_account;
        let user = &self.user.key();

        user_account.balance -= amount;
        bank.total_deposits -= amount;

        let rent = Rent::get()?;
        let user_account_info = self.user_account.to_account_info();
        let minimum_balance = rent.minimum_balance(user_account_info.data_len());

        let available_lamports = user_account_info.lamports();
        let transfer_amount = amount.min(available_lamports.saturating_sub(minimum_balance));

        **user_account_info.try_borrow_mut_lamports()? -= transfer_amount;
        **self.user.try_borrow_mut_lamports()? += transfer_amount;

        msg!(
            "Withdrawn {} lamports for {}",
            amount,
            user
        );

        Ok(())
    }
    
}