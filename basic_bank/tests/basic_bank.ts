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
  const totalDeposits = new anchor.BN(2_000_000_000); // 2 SOL
  const depositAmount = new anchor.BN(1_000_000_000); // 1 SOL
  const withdrawAmount = new anchor.BN(500_000_000); // 0.5 SOL
  const withdrawOverAvailableAmount = new anchor.BN(1_500_000_000); // 1.5 SOL

  const [userAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_account"), signer.publicKey.toBuffer()],
    program.programId,
  );

  // const [user2AccountPDA] = PublicKey.findProgramAddressSync(
  //   [Buffer.from("user_account"), user2Account.publicKey.toBuffer()],
  //   program.programId,
  // );

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
      .accountsPartial({
        bank: bankAccount.publicKey,
        userAccount: userAccountPDA,
        user: signer.publicKey,
      })
      .rpc();
    console.log("Create user account transaction signature", tx);

    const userAccountData = await program.account.userAccount.fetch(
      userAccountPDA,
    );

    const [user2AccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_account"), user2Account.publicKey.toBuffer()],
      program.programId,
    );

    const tx2 = await program.methods
      .createUserAccount()
      .accountsPartial({
        bank: bankAccount.publicKey,
        userAccount: user2AccountPDA,
        user: user2Account.publicKey,
      })
      .signers([user2Account])
      .rpc();
    console.log("Create user account transaction signature", tx2);

    assert.equal(userAccountData.owner.toString(), signer.publicKey.toString());
    assert.equal(userAccountData.balance.toString(), "0");
  });

  // it("Deposits funds into the bank", async () => {
  //   const initialUserBalance = await provider.connection.getBalance(
  //     signer.publicKey,
  //   );
  //   const initialBankBalance = await provider.connection.getBalance(
  //     bankAccount.publicKey,
  //   );

  //   console.log(`Initial user SOL balance: ${initialUserBalance / 1e9} SOL`);
  //   console.log(`Initial bank SOL balance: ${initialBankBalance / 1e9} SOL`);

  //   // deposit
  //   const tx = await program.methods
  //     .deposit(depositAmount)
  //     .accountsPartial({
  //       bank: bankAccount.publicKey,
  //       userAccount: userAccountPDA,
  //       user: signer.publicKey,
  //     })
  //     .rpc();

  //   console.log("Deposit transaction signature", tx);

  //   // get user's account balance
  //   const userAccountData = await program.account.userAccount.fetch(
  //     userAccountPDA,
  //   );

  //   assert.equal(userAccountData.balance.toString(), depositAmount.toString());

  //   const bankData = await program.account.bank.fetch(bankAccount.publicKey);

  //   assert.equal(bankData.totalDeposits.toString(), totalDeposits.toString());

  //   // get final SOL balance
  //   const finalUserBalance = await provider.connection.getBalance(
  //     signer.publicKey,
  //   );
  //   const finalBankBalance = await provider.connection.getBalance(
  //     bankAccount.publicKey,
  //   );

  //   console.log(`Final user SOL balance: ${finalUserBalance / 1e9} SOL`);
  //   console.log(`Final bank SOL balance: ${finalBankBalance / 1e9} SOL`);

  //   assert.isTrue(finalBankBalance > initialBankBalance);
  //   assert.isTrue(
  //     finalUserBalance < initialUserBalance - Number(depositAmount),
  //   );
  //   assert.isTrue(
  //     finalUserBalance > initialUserBalance - Number(depositAmount) - 10000,
  //   );
  // });

  it("Deposits funds into the bank", async () => {
    const initialUserBalance = await provider.connection.getBalance(
      signer.publicKey,
    );
    const initialBankBalance = await provider.connection.getBalance(
      bankAccount.publicKey,
    );

    console.log(`Initial user SOL balance: ${initialUserBalance / 1e9} SOL`);
    console.log(`Initial bank SOL balance: ${initialBankBalance / 1e9} SOL`);

    // deposit
    const tx = await program.methods
      .deposit(depositAmount)
      .accountsPartial({
        bank: bankAccount.publicKey,
        userAccount: userAccountPDA,
        user: signer.publicKey,
      })
      .rpc();

    console.log("Deposit transaction signature", tx);

    const [user2AccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_account"), user2Account.publicKey.toBuffer()],
      program.programId,
    );

    const tx2 = await program.methods
      .deposit(depositAmount)
      .accountsPartial({
        bank: bankAccount.publicKey,
        userAccount: user2AccountPDA,
        user: user2Account.publicKey,
      })
      .signers([user2Account])
      .rpc();

    console.log("Deposit transaction signature", tx2);

    // get user's account balance
    const userAccountData = await program.account.userAccount.fetch(
      userAccountPDA,
    );

    // assert.equal(userAccountData.balance.toString(), depositAmount.toString());

    const bankData = await program.account.bank.fetch(bankAccount.publicKey);
    console.log(bankData.totalDeposits.toString());

    // assert.equal(bankData.totalDeposits.toString(), totalDeposits.toString());

    // get final SOL balance
    const finalUserBalance = await provider.connection.getBalance(
      signer.publicKey,
    );
    const finalBankBalance = await provider.connection.getBalance(
      bankAccount.publicKey,
    );

    console.log(`Final user SOL balance: ${finalUserBalance / 1e9} SOL`);
    console.log(`Final bank SOL balance: ${finalBankBalance / 1e9} SOL`);

    // assert.isTrue(finalBankBalance > initialBankBalance);
    // assert.isTrue(
    //   finalUserBalance < initialUserBalance - Number(depositAmount),
    // );
    // assert.isTrue(
    //   finalUserBalance > initialUserBalance - Number(depositAmount) - 10000,
    // );
  });

  it("Retrieves user balance", async () => {
    const balance = await program.methods
      .getBalance()
      .accountsPartial({
        bank: bankAccount.publicKey,
        userAccount: userAccountPDA,
        user: signer.publicKey,
      })
      .view();

    assert.equal(balance.toString(), depositAmount.toString());
    console.log(`User balance: ${Number(balance) / 1e9}`);
  });

  // it("Withdraws funds from the bank", async () => {
  //   const userAccountData = await program.account.userAccount.fetch(
  //     userAccountPDA,
  //   );
  //   const initialBalance = userAccountData.balance;

  //   const initialUserBalance = await provider.connection.getBalance(
  //     signer.publicKey,
  //   );
  //   const initialBankBalance = await provider.connection.getBalance(
  //     bankAccount.publicKey,
  //   );

  //   console.log(`Initial user SOL balance: ${initialUserBalance / 1e9} SOL`);
  //   console.log(`Initial bank SOL balance: ${initialBankBalance / 1e9} SOL`);

  //   // withdraw
  //   const tx = await program.methods
  //     .withdraw(withdrawAmount)
  //     .accountsPartial({
  //       bank: bankAccount.publicKey,
  //       userAccount: userAccountPDA,
  //       user: signer.publicKey,
  //     })
  //     .rpc();

  //   console.log("Withdraw transaction signature", tx);

  //   // get the new balance
  //   const updatedUserAccountData = await program.account.userAccount.fetch(
  //     userAccountPDA,
  //   );
  //   const newBalance = updatedUserAccountData.balance;

  //   const expectedBalance = initialBalance.sub(withdrawAmount);
  //   assert.equal(newBalance.toString(), expectedBalance.toString());

  //   // const bankData = await program.account.bank.fetch(bankAccount.publicKey);
  //   // assert.equal(bankData.totalDeposits.toString(), expectedBalance.toString());

  //   const finalUserBalance = await provider.connection.getBalance(
  //     signer.publicKey,
  //   );
  //   const finalBankBalance = await provider.connection.getBalance(
  //     bankAccount.publicKey,
  //   );

  //   console.log(`Final user SOL balance: ${finalUserBalance / 1e9} SOL`);
  //   console.log(`Final bank SOL balance: ${finalBankBalance / 1e9} SOL`);

  //   // assert.isTrue(
  //   //   finalBankBalance < initialBankBalance + Number(withdrawAmount),
  //   // );
  //   // assert.isTrue(finalUserBalance > initialUserBalance - 10000);
  //   // assert.isTrue(finalBankBalance <= initialBankBalance);
  // });

  it("Withdraws more than the available funds from the bank", async () => {
    const userAccountData = await program.account.userAccount.fetch(
      userAccountPDA,
    );
    const initialBalance = userAccountData.balance;

    const initialUserBalance = await provider.connection.getBalance(
      signer.publicKey,
    );
    const initialBankBalance = await provider.connection.getBalance(
      bankAccount.publicKey,
    );

    console.log(`Initial user SOL balance: ${initialUserBalance / 1e9} SOL`);
    console.log(`Initial bank SOL balance: ${initialBankBalance / 1e9} SOL`);

    const [user2AccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_account"), user2Account.publicKey.toBuffer()],
      program.programId,
    );

    // withdraw
    const tx = await program.methods
      .withdrawVulnerable(withdrawAmount)
      .accountsPartial({
        bank: bankAccount.publicKey,
        userAccount: user2AccountPDA,
        user: user2Account.publicKey,
      })
      .signers([signer.payer])
      .rpc();

    console.log("Withdraw transaction signature", tx);

    // get the new balance
    const updatedUserAccountData = await program.account.userAccount.fetch(
      userAccountPDA,
    );
    const newBalance = updatedUserAccountData.balance;

    const expectedBalance = initialBalance.sub(withdrawAmount);
    // assert.equal(newBalance.toString(), expectedBalance.toString());

    const bankData = await program.account.bank.fetch(bankAccount.publicKey);
    console.log(Number(bankData.totalDeposits) / 1e9);

    const finalUserBalance = await provider.connection.getBalance(
      signer.publicKey,
    );
    const finalBankBalance = await provider.connection.getBalance(
      bankAccount.publicKey,
    );

    console.log(`Final user SOL balance: ${finalUserBalance / 1e9} SOL`);
    console.log(`Final bank SOL balance: ${finalBankBalance / 1e9} SOL`);

    // assert.isTrue(
    //   finalBankBalance < initialBankBalance + Number(withdrawAmount),
    // );
    // assert.isTrue(finalUserBalance > initialUserBalance - 10000);
    // assert.isTrue(finalBankBalance <= initialBankBalance);
  });

  // it("Prevents users from withdrawing more than their balance", async () => {
  //   const excessiveWithdrawAmount = new anchor.BN(2_000_000_000); // 2 SOL

  //   try {
  //     await program.methods
  //       .withdraw(excessiveWithdrawAmount)
  //       .accountsPartial({
  //         bank: bankAccount.publicKey,
  //         userAccount: userAccountPDA,
  //         user: signer.publicKey,
  //       })
  //       .rpc();
  //     assert.fail("Should have thrown an error for insufficient balance");
  //   } catch (err) {
  //     const errorMsg = err.error.errorMessage;
  //     assert.isTrue(
  //       errorMsg.includes("Insufficent funds in the bank account") ||
  //         errorMsg.includes("0x7d3"),
  //     );
  //   }
  // });
});
