use anchor_lang::prelude::*;
pub use crate::{error::*, state::*};

#[derive(Accounts)]
pub struct WithdrawSecure<'info> {
    #[account(mut)]
    pub bank: Account<'info, Bank>,

    // added constraint to ensure rightful access to withdraw funds
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

impl<'info> WithdrawSecure<'info> {
    pub fn withdraw_secure(&mut self, amount: u64) -> Result<()> {

        // added check to prevent zero amount withdrawals
        require!(amount > 0, BankError::ZeroAmount);

        let bank = &mut self.bank;
        let user_account = &mut self.user_account;
        let user = &self.user.key();

        // added check to ensure sufficient funds before withdrawal
        require!(
            user_account.balance >= amount,
            BankError::InsufficientFunds
        );

        // safe arithmetic operations to prevent overflows/underflows
        user_account.balance = user_account
            .balance
            .checked_sub(amount)
            .ok_or(BankError::Overflow)?;

        bank.total_deposits = bank
            .total_deposits
            .checked_sub(amount)
            .ok_or(BankError::Overflow)?;

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