/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";


library ArrayUtils {
  function includes(Erc20Interface[] memory a, Erc20Interface b) internal pure returns (bool) {
    for (uint256 i = 0; i < a.length; i += 1) {
      if (a[i] == b) {
        return true;
      }
    }

    return false;
  }
}
