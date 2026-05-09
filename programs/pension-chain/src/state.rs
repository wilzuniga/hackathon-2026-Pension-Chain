use anchor_lang::prelude::*;

#[account]
pub struct AffiliateProfile {
    pub authority: Pubkey,
    pub risk_profile: u8,
    pub wallet_risk_score: u8,
    pub conversation_risk_score: u8,
    pub ipfs_session_cid: [u8; 64],
    pub registered_at: i64,
    pub last_profile_change: i64,
    pub profile_change_count: u8,
    pub bump: u8,
    // deposit tracking
    pub total_sol_deposited: u64,
    pub total_sol_staked: u64,
    pub deposit_count: u32,
    pub last_deposit_at: i64,
}

impl AffiliateProfile {
    pub const LEN: usize = 8 + 32 + 1 + 1 + 1 + 64 + 8 + 8 + 1 + 1 + 8 + 8 + 4 + 8; // = 153
}

pub mod risk_profile {
    pub const CONSERVATIVE: u8 = 0;
    pub const BALANCED: u8 = 1;
    pub const AGGRESSIVE: u8 = 2;

    pub fn label(code: u8) -> &'static str {
        match code {
            CONSERVATIVE => "Conservative",
            BALANCED => "Balanced",
            AGGRESSIVE => "Aggressive",
            _ => "Unknown",
        }
    }
}
