use anchor_lang::prelude::*;

pub mod instructions;
pub use instructions::*;

pub mod state;
pub mod error;

declare_id!("BamEE3LF2mE8UM1c5tHucBDHecPnK5z9v3PaCkut1Jv5");

#[program]
pub mod basic_bank {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize()?;
        Ok(())
    }

    pub fn create_user_account(ctx: Context<CreateUserAccount>) -> Result<()> {
        ctx.accounts.create_user_account()?;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)?;
        Ok(())
    }

    pub fn get_balance(ctx: Context<GetBalance>) -> Result<u64> {
        ctx.accounts.get_balance()
    }

    pub fn withdraw_secure(ctx: Context<WithdrawSecure>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw_secure(amount)?;
        Ok(())
    }

    pub fn withdraw_vulnerable(ctx: Context<WithdrawVulnerable>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw_vulnerable(amount)?;
        Ok(())
    }
}
