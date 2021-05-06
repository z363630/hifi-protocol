// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FintrollerInterface.sol";
import "./BalanceSheetInterface.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

interface IHToken {
    function init(
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_,
        FintrollerInterface fintroller_,
        BalanceSheetInterface balanceSheet_,
        Erc20Interface underlying_,
        Erc20Interface collateral_
    ) external;
}

contract HTokenFactory {
    function deployHToken(
        address target,
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_,
        FintrollerInterface fintroller_,
        BalanceSheetInterface balanceSheet_,
        Erc20Interface underlying_,
        Erc20Interface collateral_
    ) external {
        IHToken hToken = IHToken(clone(target));

        hToken.init(
            name_,
            symbol_,
            expirationTime_,
            fintroller_,
            balanceSheet_,
            underlying_,
            collateral_
        );
    }

    function clone(address implementation) internal returns (address instance) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }

        require(instance != address(0), "ERC1167: create failed");
    }
}
