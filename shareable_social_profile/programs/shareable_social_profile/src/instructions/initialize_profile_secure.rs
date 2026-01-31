use anchor_lang::prelude::*;

use crate::{error::*, state::*};

#[derive(Accounts)]
pub struct InitializeProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Profile::INIT_SPACE,

        seeds = [b"profile", user.key().as_ref()],
        bump

        // use of PDA to ensure unique PDA account generated for profile
    )]
    pub profile: Account<'info, Profile>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>
}

impl<'info> InitializeProfile<'info>  {
    pub fn initialize(
        &mut self,
        name: String,
        title: String,
        bio: String,
        avatar_link: String
    ) -> Result<()> {
        require!(name.len() <= 50, ProfileError::TextTooLong);
        require!(title.len() <= 50, ProfileError::TextTooLong);
        require!(bio.len() <= 200, ProfileError::TextTooLong);
        require!(avatar_link.len() <= 100, ProfileError::TextTooLong);

        self.profile.set_inner( Profile{
            owner: self.user.key(),
            name,
            title,
            bio,
            avatar_link
        });

        msg!("Profile created");
        Ok(())
    }
}