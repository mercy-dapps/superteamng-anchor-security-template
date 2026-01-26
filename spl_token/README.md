<h1 align="center">SPL Token</h1>
<p align="center">
  A simple Solana program that creates, mint spl tokens, get balance, and transfer tokens.
</p>

---

### This Solana program emphasizes the use of anchor constraints for easy debugging

- **mint_token_secure** – demonstrates the use of anchor constraints in account and custom error using the require! macro. This custom error helps us debug easily since we define the error messages.
- **mint_token_vulnerable** – This instruction lacks any check from the program perspective, which is not a standard way of writing secure programs.

**spl_token.ts** – As demonstrated in the test, minting token using the "mintTokenVulnerable instruction" shows an error defined in the spl_token program when passed with an unauthorized mint authority account. It might seem easy to identify the cause of the error for an experienced developer, but it can be difficult to debug for beginners or inexperienced developers.
The mintTokenSecure on the other end would display our custom error message, making it easy to debug.
