<h1 align="center">Simple Basic Back Program</h1>
<p align="center">
  A Solana program that create a bank, user account, allows user to get balance, deposit and withdraw.
</p>

---

### This Solana program emphasizes the use of safe arithmetic operations to prevent overflows/underflows as well as some logic constraint checks
- **withdraw_secure** – demonstrates the use of anchor constraints in account as well as additional checks which includes prevention of zero amount withdrawal, validating sufficient balance before withdrawal and arithmetic check to prevent overflow or underflow.
- **withdraw_vulberable** – This instructions lacks any check leading to panics and program errors. 

**basic_bank.ts** – In the test, we demonstrated how we caught overbalance withdrawal using withdrawSecure function while withdrawVulnerable lead to overflow bug. A couple of tests for other instructions can be found here.
