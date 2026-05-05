import {
  createWalletClient,
  createPublicClient,
  http,
  parseGwei,
  parseEther,
  parseUnits,
  encodeFunctionData,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
});

const ERC20_ABI = [
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const ROUTER_ABI = [
  {
    name: "addLiquidityETH",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amountTokenDesired", type: "uint256" },
      { name: "amountTokenMin", type: "uint256" },
      { name: "amountETHMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }, { type: "uint256" }, { type: "uint256" }],
  },
] as const;

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
const routerAddress = process.env.ROUTER_ADDRESS;
const usdcAddress = process.env.USDC_ADDRESS ?? "0x534b2f3A21130d7a60830c2Df862319e593943A3";
const monAmountEth = process.env.MON_AMOUNT ?? "1";
const usdcAmount = process.env.USDC_AMOUNT ?? "3";

if (!privateKey || !routerAddress) {
  console.error("❌  Required: DEPLOYER_PRIVATE_KEY and ROUTER_ADDRESS env vars");
  process.exit(1);
}

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

async function main() {
  const monAmount = parseEther(monAmountEth);
  const usdcAmountWei = parseUnits(usdcAmount, 6);

  console.log(`\n🔑  Wallet: ${account.address}`);
  console.log(`📦  Router: ${routerAddress}`);
  console.log(`💧  Adding liquidity: ${monAmountEth} MON + ${usdcAmount} USDC`);

  // Check USDC balance
  const usdcBal = await publicClient.readContract({
    address: usdcAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });
  console.log(`\n💵  USDC balance: ${Number(usdcBal) / 1e6} USDC`);
  if (usdcBal < usdcAmountWei) {
    console.error(`❌  Insufficient USDC. Need ${usdcAmount}, have ${Number(usdcBal) / 1e6}`);
    process.exit(1);
  }

  // Approve USDC for router
  console.log("\n⏳  Approving USDC...");
  const approveTx = await walletClient.sendTransaction({
    to: usdcAddress as `0x${string}`,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [routerAddress as `0x${string}`, usdcAmountWei],
    }),
    gas: 100_000n,
    gasPrice: parseGwei("110"),
  });
  await publicClient.waitForTransactionReceipt({ hash: approveTx });
  console.log(`   ✅  Approved: ${approveTx}`);

  // Add liquidity (MON + USDC)
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
  console.log("\n⏳  Adding liquidity...");
  const liquidityTx = await walletClient.sendTransaction({
    to: routerAddress as `0x${string}`,
    value: monAmount,
    data: encodeFunctionData({
      abi: ROUTER_ABI,
      functionName: "addLiquidityETH",
      args: [
        usdcAddress as `0x${string}`,
        usdcAmountWei,
        0n,
        0n,
        account.address,
        deadline,
      ],
    }),
    gas: 500_000n,
    gasPrice: parseGwei("110"),
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: liquidityTx });
  console.log(`   ✅  Liquidity added! tx: ${liquidityTx}`);
  console.log(`\n🎉  Pool is live — MON/USDC swaps will now work in the app!`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
