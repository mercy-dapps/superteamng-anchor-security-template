use anchor_lang::prelude::*;

#[error_code]
pub enum ProfileError{
    #[msg("Text too long")]
    TextTooLong,

    #[msg("Unauthorized")]
    Unauthorized, 
} 