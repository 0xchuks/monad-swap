// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title SimpleSwap — x*y=k AMM for MON (native) <-> USDC
/// @dev Seed: transfer USDC to this address first, then call initPool(usdcAmount) with msg.value = MON.
contract SimpleSwap {
    address public immutable usdc;
    uint256 public monReserve;
    uint256 public usdcReserve;
    address public owner;

    event Swap(address indexed user, bool monIn, uint256 amountIn, uint256 amountOut);

    constructor(address _usdc) {
        usdc = _usdc;
        owner = msg.sender;
    }

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    /// @notice Seed pool reserves. Send USDC directly to this contract first.
    ///         No cross-contract calls — just sets monReserve and usdcReserve.
    function initPool(uint256 usdcAmount) external payable onlyOwner {
        require(monReserve == 0, "already init");
        require(msg.value > 0 && usdcAmount > 0, "zero amounts");
        monReserve  = msg.value;
        usdcReserve = usdcAmount;
    }

    /// @notice Quote: how many tokens out for amountIn
    /// @param amountIn  amount of input token (with decimals)
    /// @param monToUsdc true = MON→USDC, false = USDC→MON
    function getAmountOut(uint256 amountIn, bool monToUsdc) public view returns (uint256) {
        require(monReserve > 0 && usdcReserve > 0, "no liquidity");
        uint256 amountInFee = amountIn * 997;           // 0.3% fee
        uint256 inReserve   = monToUsdc ? monReserve  : usdcReserve;
        uint256 outReserve  = monToUsdc ? usdcReserve : monReserve;
        return (amountInFee * outReserve) / (inReserve * 1000 + amountInFee);
    }

    /// @notice Swap MON (native) → USDC
    function swapMonForUsdc(uint256 minUsdcOut) external payable {
        require(msg.value > 0, "zero MON");
        uint256 usdcOut = getAmountOut(msg.value, true);
        require(usdcOut >= minUsdcOut, "slippage");
        monReserve  += msg.value;
        usdcReserve -= usdcOut;
        require(IERC20(usdc).transfer(msg.sender, usdcOut), "usdc out failed");
        emit Swap(msg.sender, true, msg.value, usdcOut);
    }

    /// @notice Swap USDC → MON (native)
    function swapUsdcForMon(uint256 usdcIn, uint256 minMonOut) external {
        require(usdcIn > 0, "zero USDC");
        require(IERC20(usdc).transferFrom(msg.sender, address(this), usdcIn), "usdc in failed");
        uint256 monOut = getAmountOut(usdcIn, false);
        require(monOut >= minMonOut, "slippage");
        usdcReserve += usdcIn;
        monReserve  -= monOut;
        (bool ok,) = msg.sender.call{value: monOut}("");
        require(ok, "mon out failed");
        emit Swap(msg.sender, false, usdcIn, monOut);
    }

    receive() external payable {}
}
