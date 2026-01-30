use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Profile {
    pub owner: Pubkey,
    #[max_len(50)]
    pub name: String,
    #[max_len(50)]
    pub title: String,
    #[max_len(200)]
    pub bio: String,
    #[max_len(100)]
    pub avatar_link: String,
}