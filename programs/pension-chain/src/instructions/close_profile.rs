use anchor_lang::prelude::*;
use crate::constants::AFFILIATE_SEED;

#[derive(Accounts)]
pub struct CloseProfile<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Closed without deserialization to support old (125-byte) PDAs.
    /// Seeds verified, owner verified — lamports returned to authority manually.
    #[account(
        mut,
        seeds = [AFFILIATE_SEED, authority.key().as_ref()],
        bump,
        owner = crate::ID,
    )]
    pub affiliate_profile: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseProfile>) -> Result<()> {
    let profile = ctx.accounts.affiliate_profile.to_account_info();
    let authority = ctx.accounts.authority.to_account_info();

    // Transfer all lamports to authority
    let lamports = profile.lamports();
    **profile.try_borrow_mut_lamports()? = 0;
    **authority.try_borrow_mut_lamports()? = authority
        .lamports()
        .checked_add(lamports)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    // Zero the data so the runtime marks the account as closed
    ctx.accounts.affiliate_profile.try_borrow_mut_data()?.fill(0);

    msg!("Profile closed. Lamports returned to authority.");
    Ok(())
}
