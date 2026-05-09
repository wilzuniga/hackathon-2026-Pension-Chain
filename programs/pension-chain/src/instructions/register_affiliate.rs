use anchor_lang::prelude::*;
use crate::{
    constants::AFFILIATE_SEED,
    error::PensionError,
    state::{AffiliateProfile, risk_profile},
};

#[derive(Accounts)]
pub struct RegisterAffiliate<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = AffiliateProfile::LEN,
        seeds = [AFFILIATE_SEED, authority.key().as_ref()],
        bump,
    )]
    pub affiliate_profile: Account<'info, AffiliateProfile>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterAffiliate>,
    risk_profile_code: u8,
    wallet_risk_score: u8,
    conversation_risk_score: u8,
    ipfs_session_cid: [u8; 64],
) -> Result<()> {
    require!(risk_profile_code <= 2, PensionError::InvalidRiskProfile);
    require!(ipfs_session_cid[0] != 0, PensionError::EmptySessionCid);

    let clock = Clock::get()?;
    let profile = &mut ctx.accounts.affiliate_profile;

    profile.authority = ctx.accounts.authority.key();
    profile.risk_profile = risk_profile_code;
    profile.wallet_risk_score = wallet_risk_score;
    profile.conversation_risk_score = conversation_risk_score;
    profile.ipfs_session_cid = ipfs_session_cid;
    profile.registered_at = clock.unix_timestamp;
    profile.last_profile_change = clock.unix_timestamp;
    profile.profile_change_count = 1;
    profile.bump = ctx.bumps.affiliate_profile;

    msg!("Affiliate registered. Profile: {}", risk_profile::label(risk_profile_code));

    Ok(())
}
