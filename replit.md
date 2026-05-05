# Workspace

## Overview

pnpm workspace monorepo with two web apps on Monad testnet: an NFT Deployer (ERC-721) at `/` and a Monad Swap UI at `/swap/` for swapping MON ↔ USDC against a custom AMM.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed-pool` — reseed the SimpleSwap pool with liquidity (set `MON_AMOUNT`, `USDC_AMOUNT`, `SIMPLE_SWAP` env vars)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Web3**: wagmi v2 + viem, RainbowKit (wallet connect)

## Where things live

- `artifacts/nft-deployer/` — NFT Deployer app (Vite + React, path `/`)
- `artifacts/monad-swap/` — Monad Swap UI (Vite + React, path `/swap/`)
- `artifacts/api-server/` — Express API server (path `/api`)
- `scripts/src/` — deployment + seeding scripts for Monad testnet
- `scripts/src/contracts/SimpleSwap.sol` — custom AMM contract source
- `scripts/src/contracts/SimpleSwap.json` — compiled ABI + bytecode
- `artifacts/monad-swap/src/constants/tokens.ts` — token addresses + SimpleSwap contract address
- `artifacts/monad-swap/src/constants/abis.ts` — contract ABIs

## Architecture decisions

- **Custom SimpleSwap AMM** instead of Uniswap V2: Monad testnet has 100x+ cold-SSTORE gas costs; standard Uniswap V2 contracts (Factory, Router, WETH9) either exceed 24KB size limit or run out of gas on testnet. SimpleSwap is a minimal x*y=k AMM (2392 bytes) that works within Monad's constraints.
- **Direct USDC transfer + no transferFrom in initPool**: The pool is seeded by (1) transferring USDC directly to the contract address and (2) calling `initPool(usdcAmount)` with `msg.value = monAmount`. This avoids cross-contract calls during initialization, which are prohibitively expensive on Monad testnet.
- **No approve/transferFrom in initPool** but DO approve for user swaps: Users must approve USDC before swapping USDC → MON (standard ERC-20 flow).
- **Gas limits**: Monad testnet needs high gas for cold storage: initPool ~1M, USDC transfer ~2M, deploy ~5M. Simulations (eth_call) always succeed regardless of actual gas needs.
- **gasUsed = gasLimit** in Monad testnet receipts is a reporting artifact — actual charges for successful txs are standard EVM cost.

## Product

- **NFT Deployer**: Deploy ERC-721 collections to Monad testnet with custom name, symbol, and metadata URI.
- **Monad Swap**: Swap MON ↔ USDC against the SimpleSwap AMM on Monad testnet (chain ID 10143). Supports slippage tolerance settings, real-time quotes, and wallet balance display.

## Deployed Contracts (Monad testnet, chain 10143)

- **SimpleSwap AMM**: `0x0dc26a8dbbc4e5708c610870b49aad7fc005043d`
- **USDC**: `0x534b2f3A21130d7a60830c2Df862319e593943A3` (6 decimals)
- **Deployer wallet**: `0x43f83Bf1fA9409c565f43A770Eae765A22884371`

## Pool State

The pool is initialized with 1 wei MON + 5 USDC. Reserves are badly imbalanced. To reseed with proper liquidity:
1. Get more MON from faucet (https://faucet.monad.xyz or similar)
2. Run: `SIMPLE_SWAP=0x0dc26a8... MON_AMOUNT=1.0 USDC_AMOUNT=10 pnpm --filter @workspace/scripts run seed-pool`
   (Note: if `monReserve > 1 wei`, deploy a new SimpleSwap first)

## User Preferences

_Populate as you build_

## Gotchas

- **Do not run `pnpm dev` at workspace root** — use workflow runner or `restart_workflow`.
- **Monad cold SSTORE costs ~1M gas each** — always use high gas limits for contract init.
- **Simulation always succeeds** (`eth_call`) even if the actual tx will run out of gas — do not rely on simulation for gas estimation on Monad.
- **initPool can only be called once** — it checks `require(monReserve == 0)`. To reseed, deploy a new SimpleSwap.
- **value + gas must both fit in wallet balance** — unlike standard EVM where gas is typically small, Monad may charge full gasLimit on reverts.

## Pointers

- `.local/skills/pnpm-workspace/` — monorepo structure, TypeScript, OpenAPI codegen
- `.local/skills/react-vite/` — React + Vite artifact setup
- `scripts/src/seed-pool.ts` — script to seed/reseed SimpleSwap pool
