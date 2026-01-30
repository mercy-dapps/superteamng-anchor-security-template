use anchor_lang::prelude::*;

#[error_code]
pub enum NoteError{
    #[msg("Title is too long")]
    TitleTooLong,

    #[msg("Content is too long")]
    ContentTooLong, 

    #[msg("Not the rightful owner to view note")]
    Unauthorized, 
} 