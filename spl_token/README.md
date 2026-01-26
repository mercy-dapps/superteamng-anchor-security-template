<h1 align="center">SPL Token</h1>
<p align="center">
  A simple Solana program that creates, mint spl tokens, get balance and transfer tokens.
</p>

---

### This Solana program emphasize the use of anchor constraints for easy debugging
- **mint_token_secure** – demonstrates the use of anchor constaints in account and custom error using the require! macro. This custom helps us debug easy since we define the error messages.
- 💬 **mint_token_vulberable** – This instructions lacks any check from the program perspective which is not a good way of writing secured programs. 


**spl_token.ts** – As demonstrated in the test, the "Mint token using mintTokenVulnerable" shows error defined in the spl_token program. This might seem easy to identify the cause of the error for experienced developer but can be difficult to debug for beginners or in-experienced developers.