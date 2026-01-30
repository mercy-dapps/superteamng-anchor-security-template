import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { assert } from "chai";
import { PublicKey } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { SplToken } from "../target/types/spl_token";

describe("spl_token", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.splToken as Program<SplToken>;

  const signerKp = provider.wallet.payer;
  const toKp = new web3.Keypair();
  
  const amountToMint = new anchor.BN(100_000_000_000); // 100 tokens with 9 decimals

  // created and airdropped new user account to try to mint token
  const newUser = new web3.Keypair();
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

  it("Airdrops SOL to the newUser", async () => {
    await airdropSol(newUser.publicKey, 10e9); // airdropping 10 SOL

    const balance = await provider.connection.getBalance(newUser.publicKey);
    console.log(
      `Airdropped balance for ${newUser.publicKey.toBase58()}: ${
        balance / 1e9
      } SOL`,
    );

    assert.equal(balance, 10e9);
  });

  it("Creates a new mint", async () => {
    const [mint] = PublicKey.findProgramAddressSync(
      [Buffer.from("my_mint"), signerKp.publicKey.toBuffer()],
      program.programId,
    );

    const ata = splToken.getAssociatedTokenAddressSync(
      mint,
      signerKp.publicKey,
      false,
    );

    const tx = await program.methods
      .createToken()
      .accountsPartial({
        signer: signerKp.publicKey,
        newMint: mint,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Transaction signature", tx);
    console.log("Token (Mint Accoount) Address:", mint.toString());
  });

  // display custom readable error message when signer does not equal mint authority
  it("Mint token", async () => {
    const [mint] = PublicKey.findProgramAddressSync(
      [Buffer.from("my_mint"), signerKp.publicKey.toBuffer()],
      program.programId,
    );

    const ata = splToken.getAssociatedTokenAddressSync(
      mint,
      signerKp.publicKey,
      false,
    );

    const tx = await program.methods
      .mintToken(amountToMint)
      .accounts({
        signer: signerKp.publicKey,
        newMint: mint,
      })
      .rpc();

    console.log("Transaction signature", tx);
    const mintInfo = await splToken.getMint(provider.connection, mint);
    assert.equal(
      mintInfo.mintAuthority?.toString(),
      signerKp.publicKey.toString(),
      "Mint authority should be the signer",
    );
    assert.equal(
      mintInfo.supply.toString(),
      amountToMint.toString(),
      `Supply shoould be ${amountToMint} tokens (with 9 decimals)`,
    );

    // verifying the ATA details
    const tokenAccount = await splToken.getAccount(provider.connection, ata);
    assert.equal(
      tokenAccount.amount.toString(),
      "100000000000",
      "Token balance shoould be 100 tokens (with 9 decimals)",
    );
    console.log("Associated Token Account:", ata.toString());
  });

  it("Transfers tokens using CPI", async () => {
    const [mint] = PublicKey.findProgramAddressSync(
      [Buffer.from("my_mint"), signerKp.publicKey.toBuffer()],
      program.programId,
    );

    const fromAta = splToken.getAssociatedTokenAddressSync(
      mint,
      signerKp.publicKey,
      false,
    );

    const toAta = splToken.getAssociatedTokenAddressSync(
      mint,
      toKp.publicKey,
      false,
    );

    //  create to_ata as it doesn't exist yet
    try {
      await splToken.createAssociatedTokenAccount(
        provider.connection,
        signerKp,
        mint,
        toKp.publicKey,
      );
    } catch (err) {
      throw new Error(err);
    }

    const tranferAmount = new anchor.BN(10_000_000_000); // 10 tokens with 9 decimals

    // transfer tokens
    const tx = await program.methods
      .transferToken(tranferAmount)
      .accountsPartial({
        from: signerKp.publicKey,
        fromAta: fromAta,
        toAta: toAta,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Transfer Transaction signature", tx);

    // verify the transfer
    const toBalance = await provider.connection.getTokenAccountBalance(toAta);
    assert.equal(
      toBalance.value.amount,
      tranferAmount.toString(),
      "Recipient balance should match transfer amount",
    );
  });

  it("Reads token balance using CPI", async () => {
    const [mint] = PublicKey.findProgramAddressSync(
      [Buffer.from("my_mint"), signerKp.publicKey.toBuffer()],
      program.programId,
    );

    const ata = splToken.getAssociatedTokenAddressSync(
      mint,
      signerKp.publicKey,
      false,
    );

    const tx = await program.methods
      .getBalance()
      .accountsPartial({
        tokenAccount: ata,
      })
      .rpc();

    console.log("Get Balance Transaction signature", tx);

    // verify balance
    const balance = await provider.connection.getTokenAccountBalance(ata);
    assert.isTrue(
      balance.value.uiAmount > 0,
      "Token balance should be greater than zero",
    );
  });

   // This displays error from spl_token "Error: owner does not match" which might be difficult to debug
    it("Mint token using mintTokenVulnerable", async () => {
    const [mint] = PublicKey.findProgramAddressSync(
      [Buffer.from("my_mint"), signerKp.publicKey.toBuffer()],
      program.programId,
    );

    const ata = splToken.getAssociatedTokenAddressSync(
      mint,
      signerKp.publicKey,
      false,
    );

    const tx = await program.methods
      .mintTokenVulnerable(amountToMint) 
      .accounts({
        signer: newUser.publicKey,
        newMint: mint,
      })
      .signers([newUser])
      .rpc();

    console.log("Transaction signature", tx);
    const mintInfo = await splToken.getMint(provider.connection, mint);
    assert.equal(
      mintInfo.mintAuthority?.toString(),
      signerKp.publicKey.toString(),
      "Mint authority should be the signer",
    );
    assert.equal(
      mintInfo.supply.toString(),
      amountToMint.toString(),
      `Supply should be ${amountToMint} tokens (with 9 decimals)`,
    );

    // verifying the ATA details
    const tokenAccount = await splToken.getAccount(provider.connection, ata);
    assert.equal(
      tokenAccount.amount.toString(),
      "100000000000",
      "Token balance shoould be 100 tokens (with 9 decimals)",
    );
    console.log("Associated Token Account:", ata.toString());
  });
});
