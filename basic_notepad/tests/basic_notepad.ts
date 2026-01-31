import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { BasicNotepad } from "../target/types/basic_notepad";
import { assert } from "chai";

describe("basic_notepad", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const wallet = provider.wallet;

  const program = anchor.workspace.basicNotepad as Program<BasicNotepad>;

  const attacker = new web3.Keypair();

  // created and airdropped attacker to pay for signing
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

  const note = {
    title: "My diary",
    content: "Writing my first diary",
  };

  const updatedNote = {
    uTitle: "My diary",
    uContent: "Updated my first diary",
  };

  const { title, content } = note;
  const { uTitle, uContent } = updatedNote;

  const [notePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("note"), Buffer.from(title), wallet.publicKey.toBuffer()],
    program.programId,
  );

  const [vNotePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("note"), Buffer.from(title)],
    program.programId,
  );

  // THE SECURE PART

  it("Create note", async () => {
    const tx = await program.methods
      .createNoteSecure(title, content)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const getNote = await program.account.note.fetch(notePda);
    console.log(getNote);
    assert.equal(getNote.title, title);
  });

  it("update note", async () => {
    const tx = await program.methods
      .updateNoteSecure(uTitle, uContent)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const getNote = await program.account.note.fetch(notePda);
    console.log("Updated", getNote);
    assert.equal(getNote.content, uContent);
  });

  it("View note", async () => {
    const tx = await program.methods
      .viewNote(title)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();

    console.log("Your transaction signature", tx);
    const getNote = await program.account.note.fetch(notePda);
    console.log(getNote);
  });

  it("Delete note", async () => {
    const getNote = await program.account.note.fetch(notePda);
    console.log(getNote);

    const tx = await program.methods
      .deleteNote(title)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    console.log("deleted succefully");
  });

  // THE VULNERABLE PART
  // note created by the wallet
  it("Create note - vulnerable", async () => {
    const tx = await program.methods
      .createNoteVulnerable(title, content)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const vGetNote = await program.account.note.fetch(vNotePda);
    console.log(vGetNote);
    assert.equal(vGetNote.title, title);
  });

  it("get all notes by attacker - vulnerable", async () => {
    const vGetNote = await program.account.note.all();
    console.log(vGetNote);
  });

  // updated by an attacker
  it("update note - vulnerable", async () => {
    const tx = await program.methods
      .updateNoteVulnerable(uTitle, uContent)
      .accounts({
        user: attacker.publicKey,
      })
      .signers([attacker])
      .rpc();
    console.log("Your transaction signature", tx);

    const vGetNote = await program.account.note.fetch(vNotePda);
    console.log("Updated by another user (attacker) - vulnerable", vGetNote);
    assert.equal(vGetNote.content, uContent);
  });
});
