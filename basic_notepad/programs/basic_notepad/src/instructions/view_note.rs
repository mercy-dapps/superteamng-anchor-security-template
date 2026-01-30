use anchor_lang::prelude::*;

use crate::{error::*, state::*};

#[derive(Accounts)]
#[instruction(title: String)]
pub struct ViewNote<'info> {
    #[account(
        seeds = [b"note", title.as_bytes(), user.key().as_ref()],
        bump,
        constraint = note.author == user.key() @ NoteError::Unauthorized
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub user: Signer<'info>
}

impl<'info> ViewNote<'info>  {
    pub fn view(
        &mut self,
    ) -> Result<()> {
        require!(self.note.author == self.user.key(), NoteError::Unauthorized);

        msg!("Onwer can view note");
        Ok(())
    }
}