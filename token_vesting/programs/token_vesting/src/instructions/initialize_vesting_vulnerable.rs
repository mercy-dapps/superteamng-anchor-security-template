use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::{state::VestingAccount, error::*};



#[derive(Accounts)]
pub struct InitializeVestingVulnerable<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    /// CHECK: beneficiary does not sign
    pub beneficiary: UncheckedAccount<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = creator_token_account.mint == mint.key(),
        constraint = creator_token_account.owner == creator.key()
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    // using the init_if_needed here makes our program vulnerable as attacker 
    // can re-initialize this account to pass their account as beneficiary thereby
    // claiming the tokens

    #[account(
    init_if_needed,
    payer = creator,
    seeds = [b"vesting", creator.key().as_ref()],
    bump,
    space = 8 + VestingAccount::INIT_SPACE
    )]
    pub vesting: Account<'info, VestingAccount>,

    #[account(
        init_if_needed,
        seeds = [b"vault", vesting.key().as_ref()],
        bump,
        payer = creator,
        token::mint = mint,
        token::authority = vesting
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeVestingVulnerable<'info>  {
    pub fn initialize_vulnerable(
        &mut self, 
        total_amount: u64,
        start_time: i64,
        end_time: i64,
        bumps: &InitializeVestingVulnerableBumps
    ) -> Result<()> {

        require!(start_time < end_time, VestingError::InvalidTime);

        // Attacker can reintialize overriding existing account when called
        // setting vesting account fields
        self.vesting.set_inner(VestingAccount { 
            creator: self.creator.key(), 
            beneficiary: self.beneficiary.key(), 
            mint: self.mint.key(), 
            vault: self.vault.key(), 
            total_amount, 
            claimed_amount: 0, // this resets the claimed amoont to zero
            start_time, 
            end_time, 
            bump: bumps.vesting
        });

        // transfer tokens into vault
        let cpi_ctx = CpiContext::new(
          self.token_program.to_account_info(),
          Transfer {
            from: self.creator_token_account.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.creator.to_account_info()
          },  
        );

        token::transfer(cpi_ctx, total_amount)?;

        Ok(())
    }
}