use anchor_lang::prelude::*;

#[error_code]
pub enum PensionError {
    #[msg("Risk profile must be 0 (Conservative), 1 (Balanced), or 2 (Aggressive)")]
    InvalidRiskProfile,
    #[msg("Profile can only be updated once every 6 months")]
    ProfileChangeCooldown,
    #[msg("IPFS session CID cannot be empty")]
    EmptySessionCid,
    #[msg("SOL amount must be greater than zero")]
    ZeroDepositAmount,
    #[msg("Staked SOL amount must be greater than zero")]
    ZeroStakedAmount,
}
