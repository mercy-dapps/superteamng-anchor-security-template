use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{calculate_vested_amount, state::VestingAccount, error::* };


#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub beneficiary: Signer<'info>,

    /// CHECK: creator does not sign
    pub creator: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"vesting", creator.key().as_ref()],
        bump,
        has_one = creator,
        has_one = beneficiary
    )]
    pub vesting: Account<'info, VestingAccount>,

    #[account(
        mut,
        seeds = [b"vault", vesting.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = beneficiary_token_account.owner == beneficiary.key(),
        constraint = beneficiary_token_account.mint == vesting.mint
    )]
    pub beneficiary_token_account: Account<'info, TokenAccount>,


    pub token_program: Program<'info, Token>,
}

impl<'info> Claim<'info>  {
    pub fn claim(&mut self) -> Result<()> {
        let clock = Clock::get()?;

        let vesting = &mut self.vesting;

        let vested_amount= calculate_vested_amount(
            vesting.total_amount, 
            vesting.start_time, 
            vesting.end_time, 
            clock.unix_timestamp
        ); 

        let claimable = vested_amount.saturating_sub(vesting.claimed_amount);

        require!(claimable > 0, VestingError::NothingToClaim);

        vesting.claimed_amount += claimable;

        let creator_key = vesting.creator;

        let seeds = &[
            b"vesting",
            creator_key.as_ref(),
            &[vesting.bump]
        ];

        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            Transfer {
                from: self.vault.to_account_info(),
                to: self.beneficiary_token_account.to_account_info(),
                authority: self.vesting.to_account_info()
            },
            signer
        );

        token::transfer(cpi_ctx, claimable)?;

        Ok(())
    }
}