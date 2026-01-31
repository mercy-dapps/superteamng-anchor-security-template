import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { ShareableSocialProfile } from "../target/types/shareable_social_profile";
import { assert } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";

describe("shareable_social_profile", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .shareableSocialProfile as Program<ShareableSocialProfile>;

  const wallet = provider.wallet;
  const attacker = new web3.Keypair();
  const profileKeypair = Keypair.generate();

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

  const profile = {
    name: "Mercy",
    title: "Solana program developer",
    bio: "Solana program developer with interest in security researching. I write secure code!",
    avatar_link: "",
  };

  const profile2 = {
    name: "SuperteamNg",
    title: "Solana",
    bio: "Nigeria",
    avatar_link: "",
  };

  // updated profile
  const uProfile = {
    uName: "Mercy-dapps",
    uTitle: "Security researcher",
    uBio: "Solana program developer with interest in security researching. I write secure code!",
    uAvatar_link: "",
  };
  const { name, title, bio, avatar_link } = profile;
  const { uName, uTitle, uBio, uAvatar_link } = uProfile;

  const [profilePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), wallet.publicKey.toBuffer()],
    program.programId,
  );

  it("Create profile", async () => {
    const tx = await program.methods
      .initializeProfile(name, title, bio, avatar_link)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const getProfile = await program.account.profile.fetch(profilePda);
    assert.equal(getProfile.name, name);
  });

  it("Update profile", async () => {
    const tx = await program.methods
      .updateProfile(uName, uTitle, uBio, uAvatar_link)
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const getProfile = await program.account.profile.fetch(profilePda);
    assert.equal(getProfile.title, uTitle);
  });

  // it("Delete profile", async () => {
  //   const tx = await program.methods
  //     .deleteProfile()
  //     .accounts({
  //       user: wallet.publicKey,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  // });

  // VULNERABILITY PART
  it("Create profile - vulnerable", async () => {
    const tx = await program.methods
      .initializeProfileVulnerable(
        profile2.name,
        profile2.title,
        profile2.bio,
        profile2.avatar_link,
      )
      .accounts({
        profile: profileKeypair.publicKey,
        user: wallet.publicKey,
      })
      .signers([profileKeypair])
      .rpc();
    console.log("Your transaction signature", tx);

    const getProfile = await program.account.profile.fetch(
      profileKeypair.publicKey,
    );
    assert.equal(getProfile.name, profile2.name);
  });

  it("Get all profile - vulnerable", async () => {
    const profiles = await program.account.profile.all();
    console.log("All profiles:", profiles);
  });

  it("Delete profile - vulnerable", async () => {
    const tx = await program.methods
      .deleteProfileVulnerable()
      .accounts({
        profile: profileKeypair.publicKey,
        user: attacker.publicKey,
      })
      .signers([attacker])
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Get all profile - vulnerable", async () => {
    const profiles = await program.account.profile.all();
    console.log("All profiles:", profiles);
  });
});
