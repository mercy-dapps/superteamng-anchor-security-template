<h1 align="center">Shareable social profile Program</h1>
<p align="center">
  A Solana program that create a profile in the blockchain, sharebale anywhere.
</p>

---

### This Solana program emphasizes the Account ownership verification
- **Initialize_profile_secure** – uses PDA to enforce account oenership verification
- **Initialize_profile_vulnerablee** – The account creation mitigates account ownership verification

- **Delete_profile_secure** – This shows anchor constraints ensuring only the owner of the profile modifies account
- **Delete_profile_vulnerablee** – lacks any anchor constraints ensuring or authorization check leading to mofifying others account.


**shareable_social_profile.ts** – In the test, we explored the secured and vulnerable instructions and their impacts.
