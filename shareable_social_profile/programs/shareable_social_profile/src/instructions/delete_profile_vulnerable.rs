use anchor_lang::prelude::*;

use crate::{state::*};

#[derive(Accounts)]
pub struct DeleteProfileVulnerable<'info> {
    #[account(
        mut,
        close = user,
        // No signer check
    )]
    pub profile: Account<'info, Profile>,

    #[account(mut)]
    pub user: Signer<'info>
}

impl<'info> DeleteProfileVulnerable<'info>  {
    pub fn delete_vulnerable(&mut self) -> Result<()> {

        msg!("Profile deleted");
        Ok(())
    }
}