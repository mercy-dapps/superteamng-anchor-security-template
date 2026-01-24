use anchor_lang::prelude::*;

#[error_code]
pub enum SplTokenError {
    #[msg("You are not authorized to mint tokens.")]
    Unauthorized,
}