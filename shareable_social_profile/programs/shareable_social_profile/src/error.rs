use anchor_lang::prelude::*;

#[error_code]
pub enum ProfileError{
    #[msg("Text too long")]
    TextTooLong,

    #[msg("Not the rightful owner to view note")]
    Unauthorized, 
} 