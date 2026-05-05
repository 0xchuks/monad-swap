/**
 * Seed the SimpleSwap pool with initial liquidity.
 *
 * Prerequisites:
 *   - DEPLOYER_PRIVATE_KEY env var set
 *   - Wallet must own USDC at the USDC contract
 *   - Wallet must have enough MON for gas AND value
 *
 * Usage:
 *   SIMPLE_SWAP=0x... MON_AMOUNT=1.0 USDC_AMOUNT=10 pnpm --filter @workspace/scripts run seed-pool
 *
 * How it works (avoids cross-contract calls in initPool):
 *   1. Transfer USDC directly to SimpleSwap (ERC20 transfer)
 *   2. Call initPool(usdcAmount) with msg.value = monAmount
 *      — sets reserves with no transferFrom cross-contract call
 *
 * Gas note: Monad testnet has ~100x higher cold storage costs.
 *   Approve: ~2M gas   Transfer: ~2M gas   initPool: ~1M gas
 */

import { createWalletClient, createPublicClient, http, parseEther, parseUnits, encodeFunctionData, decodeFunctionResult } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import { createRequire } from "module";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const artifact = require("./contracts/SimpleSwap.json");

const monadTestnet = defineChain({
  id: 10143, name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
});

const rawKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!rawKey) { console.error("❌  DEPLOYER_PRIVATE_KEY not set"); process.exit(1); }
const pk = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
const account = privateKeyToAccount(pk as `0x${string}`);
const publicClient = createPublicClient({ chain: monadTestnet, transport: http("https://testnet-rpc.monad.xyz") });
const walletClient = createWalletClient({ chain: monadTestnet, transport: http("https://testnet-rpc.monad.xyz"), account });

const SIMPLE_SWAP = (process.env.SIMPLE_SWAP ?? "0x0dc26a8dbbc4e5708c610870b49aad7fc005043d") as `0x${string}`;
const USDC        = "0x534b2f3A21130d7a60830c2Df862319e593943A3" as `0x${string}`;
const MON_AMOUNT  = parseEther(process.env.MON_AMOUNT ?? "1.0");
const USDC_AMOUNT = parseUnits(process.env.USDC_AMOUNT ?? "10", 6);

const pad32 = (v: string) => v.replace("0x","").padStart(64,"0");
const RPC = "https://testnet-rpc.monad.xyz";

async function main() {
  const bal = await publicClient.getBalance({ address: account.address });
  console.log(`\n🔑  Deployer: ${account.address}`);
  console.log(`💰  Balance:  ${Number(bal)/1e18} MON`);

  const gasPrice = await publicClient.getGasPrice();
  const gp = gasPrice * 120n / 100n;
  console.log(`⛽  Gas price: ${Number(gp)/1e9} gwei`);

  // Check current reserves
  const monResData = encodeFunctionData({ abi: artifact.abi, functionName: "monReserve", args: [] });
  const r = await fetch(RPC, { method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{to:SIMPLE_SWAP,data:monResData},"latest"]}) });
  const rj = await r.json() as { result: `0x${string}` };
  const monRes = decodeFunctionResult({ abi: artifact.abi, functionName: "monReserve", data: rj.result });
  if ((monRes as bigint) > 1n) {
    console.error("❌  Pool already initialized with non-trivial reserves. Deploy a new SimpleSwap if you need to reseed.");
    process.exit(1);
  }

  // Step 1: Transfer USDC directly to SimpleSwap (no transferFrom in initPool)
  const transferData = "0xa9059cbb" + pad32(SIMPLE_SWAP) + pad32(USDC_AMOUNT.toString(16)) as `0x${string}`;
  console.log(`\n⏳  Transferring ${Number(USDC_AMOUNT)/1e6} USDC → SimpleSwap...`);
  const usdcHash = await walletClient.sendTransaction({ to: USDC, data: transferData, gas: 2_000_000n, gasPrice: gp });
  console.log(`   tx: ${usdcHash}`);
  const usdcReceipt = await publicClient.waitForTransactionReceipt({ hash: usdcHash });
  if (usdcReceipt.status !== "success") { console.error("❌  USDC transfer failed"); process.exit(1); }
  console.log("   ✅  USDC transferred");

  // Step 2: Call initPool with msg.value = MON_AMOUNT (no cross-contract calls!)
  const initData = encodeFunctionData({ abi: artifact.abi, functionName: "initPool", args: [USDC_AMOUNT] });
  console.log(`\n⏳  Calling initPool (${Number(MON_AMOUNT)/1e18} MON + ${Number(USDC_AMOUNT)/1e6} USDC)...`);
  const initHash = await walletClient.sendTransaction({
    to: SIMPLE_SWAP, data: initData, value: MON_AMOUNT,
    gas: 1_500_000n, gasPrice: gp,
  });
  console.log(`   tx: ${initHash}`);
  const initReceipt = await publicClient.waitForTransactionReceipt({ hash: initHash });
  if (initReceipt.status !== "success") { console.error("❌  initPool failed"); process.exit(1); }
  console.log("   ✅  Pool initialized");

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📦  Pool ready at ${SIMPLE_SWAP}`);
  console.log(`   MON reserve:  ${Number(MON_AMOUNT)/1e18} MON`);
  console.log(`   USDC reserve: ${Number(USDC_AMOUNT)/1e6} USDC`);
  console.log(`   Price: 1 MON ≈ ${(Number(USDC_AMOUNT)/1e6)/(Number(MON_AMOUNT)/1e18)} USDC`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
