import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { BasicBank } from "../target/types/basic_bank";

describe("basic_bank", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.basicBank as Program<BasicBank>;

  const bankAccount = Keypair.generate();
  const user2Account = Keypair.generate();
  const signer = provider.wallet;
  const depositAmount = new anchor.BN(1_000_000_000); // 1 SOL
  const withdrawAmount = new anchor.BN(500_000_000); // 0.5 SOL
  const withdrawOverAvailableAmount = new anchor.BN(1_500_000_000); // 1.5 SOL

  const [userAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_account"), signer.publicKey.toBuffer()],
    program.programId,
  );

  async function airdropSol(publicKey, amount) {
    let airdropTx = await anchor
      .getProvider()
      .connection.requestAirdrop(publicKey, amount);
    await confirmTransaction(airdropTx);
  }

  async function confirmTransaction(tx) {
    const latestBlockHash = await anchor
      .getProvider()
      .connection.getLatestBlockhash();
    await anchor.getProvider().connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: tx,
    });
  }

  it("Airdrops SOL to the signer", async () => {
    await airdropSol(user2Account.publicKey, 10e9); // airdropping 10 SOL

    const balance = await provider.connection.getBalance(
      user2Account.publicKey,
    );
    console.log(
      `Airdropped balance for ${user2Account.publicKey.toBase58()}: ${
        balance / 1e9
      } SOL`,
    );

    assert.equal(balance, 10e9);
  });

  it("Initializes the bank account", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        bank: bankAccount.publicKey,
        payer: signer.publicKey,
      })
      .signers([bankAccount])
      .rpc();
    console.log("Initialize transaction signature", tx);

    const bankData = await program.account.bank.fetch(bankAccount.publicKey);

    assert.equal(bankData.totalDeposits.toString(), "0");
  });

  it("Creates a user account", async () => {
    const tx = await program.methods
      .createUserAccount()
      .accounts({
        bank: bankAccount.publicKey,
        user: signer.publicKey,
      })
      .rpc();
    console.log("Create user account transaction signature", tx);

    const userAccountData = await program.account.userAccount.fetch(
      userAccountPDA,
    );

    assert.equal(userAccountData.owner.toString(), signer.publicKey.toString());
    assert.equal(userAccountData.balance.toString(), "0");

    // creating another user account for testing - User2

    const tx2 = await program.methods
      .createUserAccount()
      .accounts({
        bank: bankAccount.publicKey,
        user: user2Account.publicKey,
      })
      .signers([user2Account])
      .rpc();
    console.log("Create user account transaction signature", tx2);
  });

  it("Deposits funds into the bank", async () => {
    // deposit
    const tx = await program.methods
      .deposit(depositAmount)
      .accounts({
        bank: bankAccount.publicKey,
        user: signer.publicKey,
      })
      .rpc();

    console.log("Deposit transaction signature", tx);

    // deposit from another user

    const tx2 = await program.methods
      .deposit(depositAmount)
      .accounts({
        bank: bankAccount.publicKey,
        user: user2Account.publicKey,
      })
      .signers([user2Account])
      .rpc();

    console.log("Deposit transaction signature", tx2);
  });

  it("Retrieves user balance", async () => {
    const balance = await program.methods
      .getBalance()
      .accounts({
        bank: bankAccount.publicKey,
        user: signer.publicKey,
      })
      .view();

    console.log(`User balance: ${Number(balance) / 1e9}`);
  });

  it("Withdraws funds from the bank", async () => {
    // withdraw
    const tx = await program.methods
      .withdrawSecure(withdrawAmount)
      .accounts({
        bank: bankAccount.publicKey,
        user: signer.publicKey,
      })
      .rpc();

    console.log("Withdraw transaction signature", tx);
  });

  it("Withdraws more than the available funds from the bank", async () => {
    const tx = await program.methods
      .withdrawVulnerable(withdrawOverAvailableAmount)
      .accounts({
        bank: bankAccount.publicKey,
        user: user2Account.publicKey,
      })
      .signers([user2Account])
      .rpc();

    console.log("Withdraw transaction signature", tx);
  });
});
