use anchor_lang::{prelude::*, solana_program};

use crate::{error::*, state::*};

#[derive(Accounts)]
pub struct Deposit<'info> {
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

    pub system_program: Program<'info, System>,
}

impl<'info> Deposit<'info> {
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        require!(amount > 0, BankError::ZeroAmount);

        let user = &self.user.key();
        let bank = &self.bank.key();

        let transfer_ix = system_instruction::transfer(user, bank, amount);
        solana_program::program::invoke(
            &transfer_ix,
            &[
                self.user.to_account_info(),
                self.bank.to_account_info(),
            ]
        )?;

        let user_account = &mut self.user_account;

        user_account.balance = user_account
        .balance
        .checked_add(amount)
        .ok_or(BankError::Overflow)?;

        let bank = &mut self.bank;
        bank.total_deposits = bank
        .total_deposits
        .checked_add(amount)
        .ok_or(BankError::Overflow)?;

        msg!("Deposited {} lamports for {}", amount, user);

        Ok(())
    }
}