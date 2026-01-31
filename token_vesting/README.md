<h1 align="center">Token Vesting</h1>
<p align="center">
  A Solana program that locks token in a vault, releases token at intervals and user claims token.
</p>

---

### This Solana program models Re-Initialization Attacks

- **initialize_vesting_secure** – enforce the use of init, as well as authorization checks.
- **initialize_vesting_vulnerable** – this model the use of init_if_needed with no authorization checks.

**token_vesting.ts** – In the test, we demonstrated how we caught re-initialization, where attacker re-initialized and passed attacker's accounthas beneficiary thereby stealing funds. We likewise demontrated the secure program prevent this form of re-entry.
