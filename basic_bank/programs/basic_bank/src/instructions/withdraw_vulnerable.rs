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
        constraint = user_account.owner == user.key() @BankError::UnauthorizedAccess,
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>
}

impl<'info> WithdrawVulnerable<'info> {
    pub fn withdraw_vulnerable(&mut self, amount: u64) -> Result<()> {
        require!(amount > 0, BankError::ZeroAmount);

        let bank = &mut self.bank;
        let user_account = &mut self.user_account;
        let user = &self.user.key();

        // require!(
        //     user_account.balance >= amount,
        //     BankError::InsufficientFunds
        // );

        require!(
            user_account.owner == user.key(),
            BankError::UnauthorizedAccess
        );

        user_account.balance -= amount;
        bank.total_deposits -= amount;

        // user_account.balance = user_account
        //     .balance
        //     .checked_sub(amount)
        //     .ok_or(BankError::Overflow)?;

        // bank.total_deposits = bank
        //     .total_deposits
        //     .checked_sub(amount)
        //     .ok_or(BankError::Overflow)?;

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