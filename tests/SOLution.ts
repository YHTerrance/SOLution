import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SoLution } from "../target/types/so_lution";

describe("SOLution", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SoLution as Program<SoLution>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
