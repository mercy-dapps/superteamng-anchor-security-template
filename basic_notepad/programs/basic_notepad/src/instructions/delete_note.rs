use anchor_lang::prelude::*;

use crate::{error::*, state::*};

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteNote<'info> {
    #[account(
        mut,
        seeds = [b"note", title.as_bytes(), user.key().as_ref()],
        bump,
        constraint = note.author == user.key() @ NoteError::Unauthorized,
        close = user
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub user: Signer<'info>
}

impl<'info> DeleteNote<'info>  {
    pub fn delete(
        &mut self,
    ) -> Result<()> {
        require!(self.note.author == self.user.key(), NoteError::Unauthorized);

        msg!("Note closed");
        Ok(())
    }
}