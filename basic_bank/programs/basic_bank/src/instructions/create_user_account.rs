use anchor_lang::prelude::*;

pub use crate::state::*;

#[derive(Accounts)]
pub struct CreateUserAccount<'info> {
    #[account(mut)]
    pub bank: Account<'info, Bank>,

    #[account(
        init,
        payer = user,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [b"user_account", user.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> CreateUserAccount<'info> {
    pub fn create_user_account(&mut self) -> Result<()> {
        let user_account = &mut self.user_account;
        user_account.owner = self.user.key();
        user_account.balance = 0;

        msg!("User account created for: {}", self.user_account.owner);
        Ok(())
    }
}