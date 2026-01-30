use anchor_lang::prelude::*;

use crate::{error::*, state::*};

#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    #[account(
        seeds = [b"profile", user.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, Profile>,

    #[account(mut)]
    pub user: Signer<'info>
}

impl<'info> UpdateProfile<'info>  {
    pub fn update(
        &mut self,
        name: String,
        title: String,
        bio: String,
        avatar_link: String
    ) -> Result<()> {
        require!(self.profile.owner == self.user.key(), ProfileError::Unauthorized);

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

        msg!("Profile updated");
        Ok(())
    }
}