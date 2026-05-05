import { createWalletClient, createPublicClient, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const FactoryArtifact  = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const RouterArtifact   = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const WETH9Artifact    = require("@uniswap/v2-periphery/build/WETH9.json");

const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
});

const rawKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!rawKey) { console.error("❌  DEPLOYER_PRIVATE_KEY env var not set"); process.exit(1); }
const privateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
const account = privateKeyToAccount(privateKey as `0x${string}`);

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http("https://testnet-rpc.monad.xyz"),
});

const walletClient = createWalletClient({
  chain: monadTestnet,
  transport: http("https://testnet-rpc.monad.xyz"),
  account,
});

async function getGasPrice(): Promise<bigint> {
  const price = await publicClient.getGasPrice();
  return price * 120n / 100n; // 20% above current
}

async function deploy(name: string, bytecode: `0x${string}`, encodedArgs?: string): Promise<`0x${string}`> {
  console.log(`\n⏳  Deploying ${name}...`);
  const data = encodedArgs
    ? (`${bytecode}${encodedArgs.replace("0x", "")}` as `0x${string}`)
    : bytecode;

  const gasPrice = await getGasPrice();
  console.log(`   gasPrice: ${Number(gasPrice) / 1e9} gwei`);

  // Estimate gas first
  let gasEstimate: bigint;
  try {
    gasEstimate = await publicClient.estimateGas({ account: account.address, data, gasPrice });
    gasEstimate = gasEstimate * 130n / 100n; // 30% buffer
    console.log(`   gasEstimate: ${gasEstimate}`);
  } catch (e) {
    gasEstimate = 6_000_000n;
    console.log(`   gasEstimate: fallback ${gasEstimate}`);
  }

  const hash = await walletClient.sendTransaction({
    data,
    gas: gasEstimate,
    gasPrice,
  });
  console.log(`   tx: ${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error(`${name} deploy REVERTED (status=${receipt.status}). gasUsed=${receipt.gasUsed}`);
  }
  if (!receipt.contractAddress) {
    throw new Error(`${name}: no contractAddress in receipt`);
  }
  console.log(`   ✅  ${name}: ${receipt.contractAddress}`);
  return receipt.contractAddress as `0x${string}`;
}

function pad32(value: string): string {
  return value.replace("0x", "").padStart(64, "0");
}

async function main() {
  const balance = await publicClient.getBalance({ address: account.address });
  const nonce   = await publicClient.getTransactionCount({ address: account.address });
  console.log(`\n🔑  Deployer: ${account.address}`);
  console.log(`💰  Balance:  ${Number(balance) / 1e18} MON`);
  console.log(`🔢  Nonce:    ${nonce}`);

  // 1. Deploy WMON (WETH9) — no constructor args
  const wmonAddress = await deploy("WMON (WETH9)", WETH9Artifact.bytecode as `0x${string}`);

  // 2. Deploy UniswapV2Factory — constructor(address _feeToSetter)
  const factoryAddress = await deploy(
    "UniswapV2Factory",
    FactoryArtifact.bytecode as `0x${string}`,
    `0x${pad32(account.address)}`,
  );

  // 3. Deploy UniswapV2Router02 — constructor(address _factory, address _WETH)
  const routerAddress = await deploy(
    "UniswapV2Router02",
    RouterArtifact.bytecode as `0x${string}`,
    `0x${pad32(factoryAddress)}${pad32(wmonAddress)}`,
  );

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦  Deployment complete!");
  console.log(`   WMON:    ${wmonAddress}`);
  console.log(`   Factory: ${factoryAddress}`);
  console.log(`   Router:  ${routerAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Auto-patch tokens.ts
  const tokensPath = resolve(__dirname, "../../artifacts/monad-swap/src/constants/tokens.ts");
  let tokensFile = readFileSync(tokensPath, "utf8");

  // Replace WMON address (any existing value)
  tokensFile = tokensFile.replace(
    /(WMON[\s\S]*?address:\s*')[^']+(')/,
    `$1${wmonAddress}$2`
  );
  // Replace router address
  tokensFile = tokensFile.replace(
    /UniswapV2Router02:\s*'[^']+'/,
    `UniswapV2Router02: '${routerAddress}'`
  );

  writeFileSync(tokensPath, tokensFile);
  console.log("✅  Updated artifacts/monad-swap/src/constants/tokens.ts");
  console.log("\nNext: seed the MON/USDC pool:");
  console.log(`  ROUTER_ADDRESS=${routerAddress} MON_AMOUNT=1 USDC_AMOUNT=3 pnpm --filter @workspace/scripts run add-liquidity`);
}

main().catch((e) => { console.error(e); process.exit(1); });
