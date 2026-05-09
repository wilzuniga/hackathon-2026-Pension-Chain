pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("4ssu3jphFPGkmBqLkfADP48pSSvYq8rVoCSZVZtzfCHp");

#[program]
pub mod pension_chain {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn register_affiliate(
        ctx: Context<RegisterAffiliate>,
        risk_profile: u8,
        wallet_risk_score: u8,
        conversation_risk_score: u8,
        ipfs_session_cid: [u8; 64],
    ) -> Result<()> {
        register_affiliate::handler(ctx, risk_profile, wallet_risk_score, conversation_risk_score, ipfs_session_cid)
    }

    pub fn update_risk_profile(
        ctx: Context<UpdateRiskProfile>,
        new_risk_profile: u8,
        new_wallet_risk_score: u8,
        new_conversation_risk_score: u8,
        new_ipfs_session_cid: [u8; 64],
    ) -> Result<()> {
        update_risk_profile::handler(ctx, new_risk_profile, new_wallet_risk_score, new_conversation_risk_score, new_ipfs_session_cid)
    }

    pub fn confirm_deposit(
        ctx: Context<ConfirmDeposit>,
        sol_deposited: u64,
        sol_staked: u64,
    ) -> Result<()> {
        confirm_deposit::handler(ctx, sol_deposited, sol_staked)
    }

    pub fn close_profile(ctx: Context<CloseProfile>) -> Result<()> {
        close_profile::handler(ctx)
    }
}
