import * as anchor from "@coral-xyz/anchor";
import * as splToken from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { assert } from "chai";

describe("Typescript SPL Token Tests", () => {
  const provider = anchor.AnchorProvider.env();
  const signerKp = provider.wallet.payer;
  const toKp = new web3.Keypair();

  // define mint parameters
  const mintDecimals = 6;
  const mintAuthority = provider.wallet.publicKey;
  const freezeAuthority = provider.wallet.publicKey;

  it("Creates a mint account and ATA using Typescript", async () => {
    // create the mint
    const mintPublickey = await splToken.createMint(
      provider.connection,
      signerKp,
      mintAuthority,
      freezeAuthority,
      mintDecimals
    );

    console.log("Created mint:", mintPublickey.toString());

    // create ATA for the signer
    const ataAddress = await splToken.createAssociatedTokenAccount(
      provider.connection,
      signerKp,
      mintPublickey,
      signerKp.publicKey
    );

    console.log("Created ATA:", ataAddress.toString());

    // mint some tokens
    const mintAmount = BigInt(1000 * 10 ** mintDecimals);
    await splToken.mintTo(
      provider.connection,
      signerKp,
      mintPublickey,
      ataAddress,
      mintAuthority,
      mintAmount
    );

    // verify the mint
    const mintInfo = await splToken.getMint(provider.connection, mintPublickey);
    assert.equal(mintInfo.decimals, mintDecimals, "Mint decimals should match");
    assert.equal(
      mintInfo.mintAuthority?.toString(),
      mintAuthority.toString(),
      "Mint authority should match"
    );
    assert.equal(
      mintInfo.freezeAuthority?.toString(),
      freezeAuthority.toString(),
      "Freeze authority should match"
    );

    // verify the ATA balance
    const accountInfo = await splToken.getAccount(
      provider.connection,
      ataAddress
    );
    assert.equal(
      accountInfo.amount.toString(),
      mintAmount.toString(),
      "Balance should match minted amount"
    );
  });

  it("Reads token balance using typescript", async () => {
    // create a new mint for this test
    const mintPublickey = await splToken.createMint(
      provider.connection,
      signerKp,
      mintAuthority,
      freezeAuthority,
      mintDecimals
    );

    // create ATA
    const ataAddress = await splToken.createAssociatedTokenAccount(
      provider.connection,
      signerKp,
      mintPublickey,
      signerKp.publicKey
    );

    // mint tokens
    const mintAmount = BigInt(1000 * 10 ** mintDecimals);
    await splToken.mintTo(
      provider.connection,
      signerKp,
      mintPublickey,
      ataAddress,
      mintAuthority,
      mintAmount
    );

    // read balance using getAccount
    const accountInfo = await splToken.getAccount(
      provider.connection,
      ataAddress
    );
    console.log("Token balance:", accountInfo.amount.toString());
    assert.equal(
      accountInfo.amount.toString(),
      mintAmount.toString(),
      "Balance should match minted amount"
    );

    // alternative: read balance using getTokenAccountBalance
    const balance = await provider.connection.getTokenAccountBalance(
      ataAddress
    );
    assert.equal(
      balance.value.amount,
      mintAmount.toString(),
      "Balance should match minted amount"
    );
  });

  it("Transfer tokens using typescript", async () => {
    // create a new mint
    const mintPublickey = await splToken.createMint(
      provider.connection,
      signerKp,
      mintAuthority,
      freezeAuthority,
      mintDecimals
    );

    // create source ATA
    const sourceAta = await splToken.createAssociatedTokenAccount(
      provider.connection,
      signerKp,
      mintPublickey,
      signerKp.publicKey
    );

    // create destination ATA
    const destinationAta = await splToken.createAssociatedTokenAccount(
      provider.connection,
      signerKp,
      mintPublickey,
      toKp.publicKey
    );

    // mint tokens to source
    const mintAmount = BigInt(1000 * 10 ** mintDecimals);
    await splToken.mintTo(
      provider.connection,
      signerKp,
      mintPublickey,
      sourceAta,
      mintAuthority,
      mintAmount
    );

    // read balance before transfer
    const sourceBalanceBefore =
      await provider.connection.getTokenAccountBalance(sourceAta);

    const destinationBalanceBefore =
      await provider.connection.getTokenAccountBalance(destinationAta);

    console.log(
      "Source balance before transfer:",
      sourceBalanceBefore.value.amount
    );
    console.log(
      "Destination balance before transfer:",
      destinationBalanceBefore.value.amount
    );

    // transfer tokens
    const transferAmount = BigInt(500 * 10 ** mintDecimals);
    await splToken.transfer(
      provider.connection,
      signerKp,
      sourceAta,
      destinationAta,
      signerKp.publicKey,
      transferAmount
    );

    // read balance after transfer
    const sourceBalanceAfter = await provider.connection.getTokenAccountBalance(
      sourceAta
    );

    const destinationBalanceAfter =
      await provider.connection.getTokenAccountBalance(destinationAta);

    console.log(
      "Source balance after transfer:",
      sourceBalanceAfter.value.amount
    );
    console.log(
      "Destination balance after transfer:",
      destinationBalanceAfter.value.amount
    );

    assert.equal(
      sourceBalanceAfter.value.amount,
      (mintAmount - transferAmount).toString(),
      "Source should have 500 tokens left"
    );

    assert.equal(
      destinationBalanceAfter.value.amount,
      transferAmount.toString(),
      "Destination should have received 500 tokens"
    );
  });
});
