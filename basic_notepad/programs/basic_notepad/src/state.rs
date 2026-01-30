use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Note {
    pub author: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(200)]
    pub content: String,
}