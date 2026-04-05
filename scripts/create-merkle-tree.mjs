import fs from "node:fs";
import path from "node:path";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, generateSigner } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { mplBubblegum, createTree } from "@metaplex-foundation/mpl-bubblegum";
import { Keypair } from "@solana/web3.js";

function parseArg(name, defaultValue) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  if (!found) return defaultValue;
  return found.slice(prefix.length);
}

function parseNumberArg(name, defaultValue, minValue = 1) {
  const raw = parseArg(name, String(defaultValue));
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < minValue) {
    throw new Error(`Invalid --${name} value: ${raw}`);
  }
  return parsed;
}

function expandHome(inputPath) {
  if (inputPath.startsWith("~/")) {
    const home = process.env.USERPROFILE || process.env.HOME;
    if (!home) throw new Error("Cannot resolve home directory for keypair path");
    return path.join(home, inputPath.slice(2));
  }
  return inputPath;
}

async function main() {
  const rpc = parseArg("rpc", "https://api.devnet.solana.com");
  const keypairPath = expandHome(
    parseArg("keypair", "C:/Users/nisha/.config/solana/id.json")
  );
  const maxDepth = parseNumberArg("maxDepth", 14);
  const maxBufferSize = parseNumberArg("maxBufferSize", 64);
  const canopyDepth = parseNumberArg("canopyDepth", 0, 0);

  const secretRaw = fs.readFileSync(keypairPath, "utf8");
  const secret = Uint8Array.from(JSON.parse(secretRaw));
  const signer = Keypair.fromSecretKey(secret);

  const umi = createUmi(rpc).use(mplBubblegum());
  umi.use(keypairIdentity(fromWeb3JsKeypair(signer), true));

  const merkleTree = generateSigner(umi);
  const txBuilder = await createTree(umi, {
    merkleTree,
    maxDepth,
    maxBufferSize,
    canopyDepth,
  });

  const result = await txBuilder.sendAndConfirm(umi, {
    confirm: { commitment: "confirmed" },
  });

  console.log("MERKLE_TREE_ADDRESS=" + merkleTree.publicKey);
  console.log("SIGNATURE_BYTES=" + Array.from(result.signature).join(","));
  console.log("RPC=" + rpc);
}

main().catch((error) => {
  console.error("Failed to create Merkle tree:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
