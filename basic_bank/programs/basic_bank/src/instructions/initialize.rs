use anchor_lang::prelude::*;

pub use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + Bank::INIT_SPACE,
    )]
    pub bank: Account<'info, Bank>,

    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self) -> Result<()> {
        let bank = &mut self.bank;
        bank.total_deposits = 0;

        msg!("Bank initialized");
        Ok(())
    }
}