<h1 align="center">SuperteamNg Bounty - Intermediate Developer Challenge: Anchor/Pinocchio Security Template</h1>
<p align="center">
  This bounty focuses on building a clear, educational security reference for Solana developers by contrasting vulnerable code with secure alternatives. The goal is to make security concepts practical and obvious, especially for developers learning Anchor or Pinocchio.
</p>

---

#### This repository consists of 5 simple solana programs that emphasis security concepts in writing more efficient and secured programs

- **Basic Bank** – A solana program that models a traditional bank in a decentralized manner. Key functionalities includes: initialize_bank, create_user_account, deposit, get_balance, withdraw.

This solana program demonstrates a key common security issue: funds withdrawal by attackers. It emphasize the need for <strong>Checked Math / Overflow and Authorization Checks using anchor contraints</strong>.

- **Basic Notepad** – Majority of people keeps notepad, either for tracking todolist or for documenting events has they unfold. Notepads are dear to our hearts, but what happens if our documented notes get tampered with by someelse making us lose the valueable things in it. Another common vulnerablity is <strong>PDA collision</strong>. We ensured PDA accounts are generated uniquely ensuring no collisions.

- **Shareable Social Profile** – The world is now digital just as business cards can be. A link that contains brief details about you accessible to people worldwide. Here, I created a solana program that create a shareable digital copy of you. User can create, update and delete profile. We exploited a common issue in web2, account deletion. You can wake up to see your account blocked. Now, user are forced to create a backup accounts. Writing a secure program includes ensuring <strong>Account Ownership Verification</strong>. We must allowed strict modification by the owner of the profile, meaning your account cannot be blocked or modified by another user.

- **SPL Token** – Number one common exploit is lack of <strong>Authorization Checks</strong>. We have seen token minted from an unauthorized account leading to loss of cash. We demonstrated this exploit and provide a secured solana version of the program instruction.

- **Token Vesting** – This is my favorite solana program. User locks token and the token get released at intervals and are claimable anytime. This introduces the <strong>Re-Initialization Attacks</strong> where attackers re-initialize account and then redirect the recipient accout to their account, stealing funds.

#### Instructions - How to check out each program

- **Build** – anchor build
- **Test** – anchor test
