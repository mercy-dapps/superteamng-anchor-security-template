use anchor_lang::prelude::*;

use crate::{error::*, state::*};

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateNote<'info> {
    #[account(
        mut,
        seeds = [b"note", title.as_bytes(), user.key().as_ref()],
        bump,

        // Added signer check
        constraint = note.author == user.key() @ NoteError::Unauthorized,
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub user: Signer<'info>
}

impl<'info> UpdateNote<'info>  {
    pub fn update(
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