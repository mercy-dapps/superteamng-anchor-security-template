use anchor_lang::prelude::*;

declare_id!("DjhMNKkPyGd3KdRLe8rZTmCWnifZUorYCazPPT5ZY4th");

pub mod instructions;
pub use instructions::*;
pub mod helper;

pub mod state;
pub mod error;
pub use helper::calculate_vested_amount;

#[program]
pub mod token_vesting {
    use super::*;

    pub fn initialize_vesting_secure(
        ctx: Context<InitializeVesting>,
        total_amount: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        
        ctx.accounts.initialize(
            total_amount,
            start_time,
            end_time,
            &ctx.bumps
        )?;

        Ok(())
    }

    pub fn initialize_vesting_vulnerable(
        ctx: Context<InitializeVestingVulnerable>,
        total_amount: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        
        ctx.accounts.initialize_vulnerable(
            total_amount,
            start_time,
            end_time,
            &ctx.bumps
        )?;

        Ok(())
    }

    pub fn claim(
        ctx: Context<Claim>,
    ) -> Result<()> {
        ctx.accounts.claim( 
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
