import { createWalletClient, createPublicClient, http, parseGwei, encodeDeployData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const FactoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const RouterArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const WETH9Artifact = require("@uniswap/v2-periphery/build/WETH9.json");

const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
});

const rawKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!rawKey) {
  console.error("❌  DEPLOYER_PRIVATE_KEY env var not set");
  process.exit(1);
}
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

async function deploy(name: string, bytecode: `0x${string}`, args?: `0x${string}`) {
  console.log(`\n⏳  Deploying ${name}...`);
  const data = args ? (`${bytecode}${args.slice(2)}` as `0x${string}`) : bytecode;
  const hash = await walletClient.sendTransaction({
    data,
    gas: 5_000_000n,
    gasPrice: parseGwei("110"),
  });
  console.log(`   tx: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error(`${name} deploy failed`);
  console.log(`   ✅  ${name}: ${receipt.contractAddress}`);
  return receipt.contractAddress as `0x${string}`;
}

function abiEncode32(value: string): `0x${string}` {
  return `0x${value.replace("0x", "").padStart(64, "0")}` as `0x${string}`;
}

function abiEncodeTwoAddresses(a: string, b: string): `0x${string}` {
  return `0x${a.replace("0x", "").padStart(64, "0")}${b.replace("0x", "").padStart(64, "0")}` as `0x${string}`;
}

async function main() {
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`\n🔑  Deployer: ${account.address}`);
  console.log(`💰  Balance:  ${Number(balance) / 1e18} MON`);

  if (balance < parseGwei("52") * 5_000_000n * 3n) {
    console.error("❌  Insufficient balance for deployment (need ~0.5 MON)");
    process.exit(1);
  }

  // 1. Deploy WMON (wrapped native token)
  const wmonAddress = await deploy("WMON (WETH9)", WETH9Artifact.bytecode as `0x${string}`);

  // 2. Deploy UniswapV2Factory (constructor arg: feeToSetter = deployer address)
  const factoryAddress = await deploy(
    "UniswapV2Factory",
    FactoryArtifact.bytecode as `0x${string}`,
    abiEncode32(account.address)
  );

  // 3. Deploy UniswapV2Router02 (constructor args: factory, WMON)
  const routerAddress = await deploy(
    "UniswapV2Router02",
    RouterArtifact.bytecode as `0x${string}`,
    abiEncodeTwoAddresses(factoryAddress, wmonAddress)
  );

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦  Deployment complete!");
  console.log(`   WMON:    ${wmonAddress}`);
  console.log(`   Factory: ${factoryAddress}`);
  console.log(`   Router:  ${routerAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Patch tokens.ts automatically
  const tokensPath = resolve(__dirname, "../../artifacts/monad-swap/src/constants/tokens.ts");
  let tokensFile = readFileSync(tokensPath, "utf8");

  tokensFile = tokensFile.replace(
    /address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701'/,
    `address: '${wmonAddress}'`
  );
  tokensFile = tokensFile.replace(
    /UniswapV2Router02: '0x[0-9a-fA-F]+'/,
    `UniswapV2Router02: '${routerAddress}'`
  );

  writeFileSync(tokensPath, tokensFile);
  console.log("✅  Updated artifacts/monad-swap/src/constants/tokens.ts");
  console.log("\nNext step: add liquidity to create the MON/USDC pool.");
  console.log("Run: pnpm --filter @workspace/scripts run add-liquidity");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
