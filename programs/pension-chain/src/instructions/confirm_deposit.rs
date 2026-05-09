use anchor_lang::prelude::*;
use crate::{
    constants::AFFILIATE_SEED,
    error::PensionError,
    state::AffiliateProfile,
};

#[derive(Accounts)]
pub struct ConfirmDeposit<'info> {
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

/// Records a Marinade Native stake made by the frontend.
/// Frontend calls buildCreateAuthorizedStakeInstructions, sends tx, then calls this.
/// For hackathon: trusts frontend-reported amounts. Post-hackathon: verify on-chain via stake account.
///
/// # Arguments
/// * `sol_deposited` - total lamports used to create the stake account
/// * `sol_staked`    - lamports actually staked (may differ slightly due to rent)
pub fn handler(
    ctx: Context<ConfirmDeposit>,
    sol_deposited: u64,
    sol_staked: u64,
) -> Result<()> {
    require!(sol_deposited > 0, PensionError::ZeroDepositAmount);
    require!(sol_staked > 0, PensionError::ZeroStakedAmount);

    let clock = Clock::get()?;
    let profile = &mut ctx.accounts.affiliate_profile;

    profile.total_sol_deposited = profile.total_sol_deposited.saturating_add(sol_deposited);
    profile.total_sol_staked = profile.total_sol_staked.saturating_add(sol_staked);
    profile.deposit_count = profile.deposit_count.saturating_add(1);
    profile.last_deposit_at = clock.unix_timestamp;

    msg!(
        "Deposit #{}: {} lamports deposited, {} lamports staked via Marinade Native. Cumulative staked: {}",
        profile.deposit_count,
        sol_deposited,
        sol_staked,
        profile.total_sol_staked,
    );

    Ok(())
}
