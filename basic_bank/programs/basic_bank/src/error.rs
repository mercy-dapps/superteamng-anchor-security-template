use anchor_lang::prelude::*;

#[error_code]
pub enum BankError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,

    #[msg("Insufficient balance for withdrawal")]
    InsufficientBalance,

    #[msg("Arithmetic overflow")]
    Overflow,

     #[msg("Arithmetic underflow")]
    Underflow,

     #[msg("Insufficent funds in the bank account")]
    InsufficientFunds,

     #[msg("Unauthorized access to user account")]
    UnauthorizedAccess,
}