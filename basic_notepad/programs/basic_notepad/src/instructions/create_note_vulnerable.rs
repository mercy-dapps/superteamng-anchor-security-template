use anchor_lang::prelude::*;

use crate::{error::*, state::*};

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateNoteVulnerable<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Note::INIT_SPACE,

        // Seeds used does not generate unique PDAs
        seeds = [b"note", title.as_bytes()],
        bump
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>
}

impl<'info> CreateNoteVulnerable<'info>  {
    pub fn create_vulnerable(
        &mut self,
        title: String,
        content: String
    ) -> Result<()> {
        require!(title.len() <= 50, NoteError::TitleTooLong);
        require!(content.len() <= 50, NoteError::ContentTooLong);

        self.note.set_inner( Note{
            author: self.user.key(),
            title,
            content
        });

        msg!("Note created");
        Ok(())
    }
}