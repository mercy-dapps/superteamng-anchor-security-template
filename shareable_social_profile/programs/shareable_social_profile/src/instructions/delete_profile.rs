use anchor_lang::prelude::*;

use crate::{error::*, state::*};

#[derive(Accounts)]
pub struct DeleteProfile<'info> {
    #[account(
        mut,
        close = user,
        seeds = [b"profile", user.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, Profile>,

    #[account(mut)]
    pub user: Signer<'info>
}

impl<'info> DeleteProfile<'info>  {
    pub fn delete(&mut self) -> Result<()> {
        require!(self.profile.owner == self.user.key(), ProfileError::Unauthorized);

        msg!("Profile deleted");
        Ok(())
    }
}