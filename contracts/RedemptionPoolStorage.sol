/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "./FintrollerInterface.sol";
import "./FyTokenInterface.sol";
import "./external/balancer/BPoolInterface.sol";

/**
 * @title RedemptionPoolStorage
 * @author Hifi
 */
abstract contract RedemptionPoolStorage {
    /**
     * @notice The unique Fintroller associated with this contract.
     */
    FintrollerInterface public fintroller;

    /**
     * @notice The amount of the underlying asset available to be redeemed after maturation.
     */
    uint256 public totalUnderlyingSupply;

    /**
     * The unique fyToken associated with this Redemption Pool.
     */
    FyTokenInterface public fyToken;

    /**
     * @notice Indicator that this is a Redemption Pool contract, for inspection.
     */
    bool public constant isRedemptionPool = true;

    /**
     * @notice Indicator that calling LP functionality is exclusive to RedemptionPool admin.
     */
    bool public isAdminLocked = true;

    struct LPPosition {
        uint256 underlyingAmount;
        uint256 poolShare;
    }

    /**
     * @notice The Balancer pool for `underlying:fyToken` pair.
     */
    BPoolInterface public bPool;

    /**
     * @notice Bookkeeping to keep track of all liquidity providers and how much underlying tokens each has provided.
     */
    mapping(address => LPPosition) public lpPositions;

    /**
     * @notice The Balancer Factory contract.
     * @dev This is the mainnet version of the Balancer Factory. Change it with the testnet version when needed.
     */
    address public constant BFACTORY_ADDRESS = 0x9424B1412450D0f8Fc2255FAf6046b98213B76Bd;
}
