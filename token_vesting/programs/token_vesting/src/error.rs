use anchor_lang::prelude::*;

#[error_code]
pub enum VestingError {
    #[msg("Invalid vesting time range")]
    InvalidTime,

    #[msg("Nothing to claim")]
    NothingToClaim
}