// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/token/erc20/IErc20.sol";

import "../core/balanceSheet/BalanceSheetV1.sol";
import "../core/fintroller/IFintrollerV1.sol";
import "../core/hToken/IHToken.sol";
import "../oracles/IChainlinkOperator.sol";

/// @title GodModeBalanceSheet
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeBalanceSheet is BalanceSheetV1 {
    constructor(IFintrollerV1 fintroller_, IChainlinkOperator oracle_) {
        BalanceSheetV1.initialize(fintroller_, oracle_);
    }

    function __godMode_burnHTokens(IHToken bond, uint256 burnAmount) external {
        bond.burn(msg.sender, burnAmount);
    }

    function __godMode_mintHTokens(IHToken bond, uint256 mintAmount) external {
        bond.mint(msg.sender, mintAmount);
    }

    function __godMode_setBondList(address account, IHToken[] memory bondList) external {
        vaults[account].bondList = bondList;
    }

    function __godMode_setCollateralAmount(
        address account,
        IErc20 collateral,
        uint256 newCollateralAmount
    ) external {
        vaults[account].collateralAmounts[collateral] = newCollateralAmount;
    }

    function __godMode_setCollateralList(address account, IErc20[] memory collateralList) external {
        vaults[account].collateralList = collateralList;
    }

    function __godMode_setDebtAmount(
        address account,
        IHToken bond,
        uint256 newDebtAmount
    ) external {
        vaults[account].debtAmounts[bond] = newDebtAmount;
    }
}
