use anchor_lang::prelude::*;

declare_id!("AHjqGELuBvntHtorC3vGaMQ1SDu7YY7YbDTJkEE58pFV");

pub mod instructions;
pub use instructions::*;

pub mod state;
pub mod error;

#[program]
pub mod basic_notepad {
    use super::*;

    pub fn create_note(
        ctx: Context<CreateNote>,
        title: String,
        content: String
    ) -> Result<()> {
       
       ctx.accounts.create(
        title,
        content
       )?;

        Ok(())
    }

    pub fn view_note(
        ctx: Context<ViewNote>,
        _title: String
    ) -> Result<()> {
       
       ctx.accounts.view()?;

        Ok(())
    }

    pub fn delete_note(
        ctx: Context<DeleteNote>,
        _title: String
    ) -> Result<()> {
       
       ctx.accounts.delete()?;

        Ok(())
    }

    pub fn update_note(
        ctx: Context<UpdateNote>,
        title: String,
        content: String
    ) -> Result<()> {
       
       ctx.accounts.update(
        title,
        content
       )?;

        Ok(())
    }

    // vulnerable

      pub fn create_note_vulnerable(
        ctx: Context<CreateNoteVulnerable>,
        title: String,
        content: String
    ) -> Result<()> {
       
       ctx.accounts.create_vulnerable(
        title,
        content
       )?;

        Ok(())
    }

     pub fn update_note_vulnerable(
        ctx: Context<UpdateNoteVulnerable>,
        title: String,
        content: String
    ) -> Result<()> {
       
       ctx.accounts.update_vulnerable(
        title,
        content
       )?;

        Ok(())
    }
}
