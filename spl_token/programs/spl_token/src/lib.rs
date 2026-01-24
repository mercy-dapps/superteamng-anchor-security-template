use anchor_lang::prelude::*;

pub mod instructions;
pub use instructions::*;

pub mod error;

declare_id!("FLpEWFKZdquxuDzvx8xTff4Rc868ShDSAoSjst7eG4Ky");

#[program]
pub mod spl_token {

    use super::*;
    
    pub fn create_token(ctx: Context<CreateToken>) -> Result<()> {
        ctx.accounts.create_token()?;

        Ok(())
    }
    
    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        ctx.accounts.mint_token(amount)?;

        Ok(())
    }

    pub fn mint_token_vulnerable(ctx: Context<MintTokenVulnerable>, amount: u64) -> Result<()> {
        ctx.accounts.mint_token_vulnerable(amount)?;

        Ok(())
    }

    pub fn transfer_token(ctx: Context<TransferSpl>, amount: u64) -> Result<()> {
        ctx.accounts.transfer_token(amount)?;

        Ok(())
    }
    pub fn get_balance(ctx: Context<GetBalance>) -> Result<()> {
        ctx.accounts.get_balance()?;

        Ok(())
    }
  
}
