export const SIMPLE_SWAP_ABI = [
  {
    name: 'getAmountOut',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'monToUsdc', type: 'bool' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'swapMonForUsdc',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'minUsdcOut', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'swapUsdcForMon',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'usdcIn', type: 'uint256' },
      { name: 'minMonOut', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'monReserve',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'usdcReserve',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'addLiquidity',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'usdcAmount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  }
] as const;

export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  }
] as const;
