import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { BasicNotepad } from "../target/types/basic_notepad";
import { assert } from "chai";

describe("basic_notepad", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const wallet = provider.wallet;

  const program = anchor.workspace.basicNotepad as Program<BasicNotepad>;

  const note = {
    title: "My dairy",
    content: "Writing my first diary",
  };

  const { title, content } = note;

  const [notePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("note"), Buffer.from(title), wallet.publicKey.toBuffer()],
    program.programId,
  );

  it("Create note", async () => {
    const tx = await program.methods
      .createNote(title, content)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const getNote = await program.account.note.fetch(notePda);
    assert.equal(getNote.title, title);
  });

  it("View note", async () => {
    const tx = await program.methods
      .viewNote(title)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Delete note", async () => {
    const tx = await program.methods
      .deleteNote(title)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const getNote = await program.account.note.fetch(notePda);
    assert.equal(getNote.title, title);
  });
});
