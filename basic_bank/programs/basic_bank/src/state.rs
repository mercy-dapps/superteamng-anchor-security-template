use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub owner: Pubkey,
    pub balance: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Bank {
    pub total_deposits: u64,
}