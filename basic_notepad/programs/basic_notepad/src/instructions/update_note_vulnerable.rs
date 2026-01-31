use anchor_lang::prelude::*;

use crate::{error::*, state::*};

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateNoteVulnerable<'info> {
    #[account(
        mut,
        seeds = [b"note", title.as_bytes()],
        bump,

        // No signer check added
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub user: Signer<'info>
}

impl<'info> UpdateNoteVulnerable<'info>  {
    pub fn update_vulnerable(
        &mut self,
        title: String,
        content: String
    ) -> Result<()> {
        require!(title.len() <= 50, NoteError::TitleTooLong);
        require!(content.len() <= 50, NoteError::ContentTooLong);

        self.note.title = title;
        self.note.content = content;

        msg!("Note Updated");
        Ok(())
    }
}