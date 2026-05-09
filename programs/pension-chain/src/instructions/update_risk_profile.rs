use anchor_lang::prelude::*;
use crate::{
    constants::{AFFILIATE_SEED, SIX_MONTHS_SECS},
    error::PensionError,
    state::{AffiliateProfile, risk_profile},
};

#[derive(Accounts)]
pub struct UpdateRiskProfile<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [AFFILIATE_SEED, authority.key().as_ref()],
        bump = affiliate_profile.bump,
        has_one = authority,
    )]
    pub affiliate_profile: Account<'info, AffiliateProfile>,
}

pub fn handler(
    ctx: Context<UpdateRiskProfile>,
    new_risk_profile: u8,
    new_wallet_risk_score: u8,
    new_conversation_risk_score: u8,
    new_ipfs_session_cid: [u8; 64],
) -> Result<()> {
    require!(new_risk_profile <= 2, PensionError::InvalidRiskProfile);
    require!(new_ipfs_session_cid[0] != 0, PensionError::EmptySessionCid);

    let clock = Clock::get()?;
    let profile = &mut ctx.accounts.affiliate_profile;
    let elapsed = clock.unix_timestamp - profile.last_profile_change;

    require!(elapsed >= SIX_MONTHS_SECS, PensionError::ProfileChangeCooldown);

    profile.risk_profile = new_risk_profile;
    profile.wallet_risk_score = new_wallet_risk_score;
    profile.conversation_risk_score = new_conversation_risk_score;
    profile.ipfs_session_cid = new_ipfs_session_cid;
    profile.last_profile_change = clock.unix_timestamp;
    profile.profile_change_count = profile.profile_change_count.saturating_add(1);

    msg!("Profile updated to: {}", risk_profile::label(new_risk_profile));

    Ok(())
}
