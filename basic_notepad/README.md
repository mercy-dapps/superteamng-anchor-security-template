<h1 align="center">Simple Basic Notepad Program</h1>
<p align="center">
  A Solana program that create notepad.
</p>

---

### This Solana program emphasizes the importance of PDA unique generation
- **Create_note_secure** – demonstrates the use of seeds in generating unique PDAs preventiing PDA collision.
- **Create_note_vulnerablee** – this also demonstrates the use of seeds without consideration for uniqueness leading PDA collision.

- **Update_note_secure** – This shows anchor constraints ensuring only the owner of the notepad modifies account
- **Update_note_vulnerablee** – lacks any anchor constraints ensuring or authorization check leading to mofifying others account.


**basic_notepad.ts** – In the test, we demonstrated how writing a secure program can improve privacy while an unsecure program remove trust and privacy as attackers modifies account.
