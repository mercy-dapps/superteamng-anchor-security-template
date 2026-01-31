use anchor_lang::prelude::*;

declare_id!("9db4RJjo9AqNajuFANbeP3cMMmvuwFkh3B8XsVDxqqLz");

pub mod instructions;
pub use instructions::*;

pub mod state;
pub mod error;

#[program]
pub mod shareable_social_profile {
    use super::*;

    pub fn initialize_profile(
        ctx: Context<InitializeProfile>,
        name: String,
        title: String,
        bio: String,
        avatar_link: String
    ) -> Result<()> {
       
       ctx.accounts.initialize(
        name,
        title,
        bio,
        avatar_link
       )?;

        Ok(())
    }

    pub fn initialize_profile_vulnerable(
        ctx: Context<InitializeProfileVulnerable>,
        name: String,
        title: String,
        bio: String,
        avatar_link: String
    ) -> Result<()> {
       
       ctx.accounts.initialize_vulnerable(
        name,
        title,
        bio,
        avatar_link
       )?;

        Ok(())
    }

     pub fn update_profile(
        ctx: Context<UpdateProfile>,
        name: String,
        title: String,
        bio: String,
        avatar_link: String
    ) -> Result<()> {
       
       ctx.accounts.update(
        name,
        title,
        bio,
        avatar_link
       )?;

        Ok(())
    }

    pub fn delete_profile(
        ctx: Context<DeleteProfile>
    ) -> Result<()> {
       
       ctx.accounts.delete()?;

        Ok(())
    }
    pub fn delete_profile_vulnerable(
        ctx: Context<DeleteProfileVulnerable>
    ) -> Result<()> {
       
       ctx.accounts.delete_vulnerable()?;

        Ok(())
    }

}
