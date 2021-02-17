/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/math/CarefulMath.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "@paulrberg/contracts/token/erc20/Erc20Recover.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@paulrberg/contracts/utils/ReentrancyGuard.sol";

import "./FintrollerInterface.sol";
import "./RedemptionPoolInterface.sol";
import "./external/balancer/BFactoryInterface.sol";

/**
 * @title RedemptionPool
 * @author Hifi
 * @notice Mints 1 fyToken in exhchange for 1 underlying before maturation and burns 1 fyToken
 * in exchange for 1 underlying after maturation.
 * @dev Instantiated by the fyToken in its constructor.
 */
contract RedemptionPool is
    CarefulMath, /* no dependency */
    ReentrancyGuard, /* no dependency */
    RedemptionPoolInterface, /* one dependency */
    Admin, /* two dependencies */
    Erc20Recover /* five dependencies */
{
    using SafeErc20 for Erc20Interface;

    /**
     * @param fintroller_ The address of the Fintroller contract.
     * @param fyToken_ The address of the fyToken contract.
     */
    constructor(FintrollerInterface fintroller_, FyTokenInterface fyToken_) Admin() {
        /* Set the Fintroller contract and sanity check it. */
        fintroller = fintroller_;
        fintroller.isFintroller();

        /**
         * Set the fyToken contract. It cannot be sanity-checked because the fyToken creates this
         * contract in its own constructor and contracts cannot be called while initializing.
         */
        fyToken = fyToken_;
    }

    struct RedeemFyTokensLocalVars {
        MathError mathErr;
        uint256 newUnderlyingTotalSupply;
        uint256 underlyingPrecisionScalar;
        uint256 underlyingAmount;
    }

    /**
     * @notice Pays the token holder the face value at maturation time.
     *
     * @dev Emits a {RedeemFyTokens} event.
     *
     * Requirements:
     *
     * - Must be called after maturation.
     * - The amount to redeem cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - There must be enough liquidity in the Redemption Pool.
     *
     * @param fyTokenAmount The amount of fyTokens to redeem for the underlying asset.
     * @return bool true = success, otherwise it reverts.
     */
    function redeemFyTokens(uint256 fyTokenAmount) external override nonReentrant returns (bool) {
        RedeemFyTokensLocalVars memory vars;

        /* Checks: maturation time. */
        require(block.timestamp >= fyToken.expirationTime(), "ERR_BOND_NOT_MATURED");

        /* Checks: the zero edge case. */
        require(fyTokenAmount > 0, "ERR_REDEEM_FYTOKENS_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getRedeemFyTokensAllowed(fyToken), "ERR_REDEEM_FYTOKENS_NOT_ALLOWED");

        /**
         * fyTokens always have 18 decimals so the underlying amount needs to be downscaled.
         * If the precision scalar is 1, it means that the underlying also has 18 decimals.
         */
        vars.underlyingPrecisionScalar = fyToken.underlyingPrecisionScalar();
        if (vars.underlyingPrecisionScalar != 1) {
            (vars.mathErr, vars.underlyingAmount) = divUInt(fyTokenAmount, vars.underlyingPrecisionScalar);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_REDEEM_FYTOKENS_MATH_ERROR");
        } else {
            vars.underlyingAmount = fyTokenAmount;
        }

        /* Checks: there is enough liquidity. */
        require(vars.underlyingAmount <= totalUnderlyingSupply, "ERR_REDEEM_FYTOKENS_INSUFFICIENT_UNDERLYING");

        /* Effects: decrease the remaining supply of underlying. */
        (vars.mathErr, vars.newUnderlyingTotalSupply) = subUInt(totalUnderlyingSupply, vars.underlyingAmount);
        assert(vars.mathErr == MathError.NO_ERROR);
        totalUnderlyingSupply = vars.newUnderlyingTotalSupply;

        /* Interactions: burn the fyTokens. */
        require(fyToken.burn(msg.sender, fyTokenAmount), "ERR_SUPPLY_UNDERLYING_CALL_BURN");

        /* Interactions: perform the Erc20 transfer. */
        fyToken.underlying().safeTransfer(msg.sender, vars.underlyingAmount);

        emit RedeemFyTokens(msg.sender, fyTokenAmount, vars.underlyingAmount);

        return true;
    }

    struct SupplyUnderlyingLocalVars {
        MathError mathErr;
        uint256 fyTokenAmount;
        uint256 newUnderlyingTotalSupply;
        uint256 underlyingPrecisionScalar;
    }

    /**
     * @notice An alternative to the usual minting method that does not involve taking on debt.
     *
     * @dev Emits a {SupplyUnderlying} event.
     *
     * Requirements:
     *
     * - Must be called prior to maturation.
     * - The amount to supply cannot be zero.
     * - The Fintroller must allow this action to be performed.
     * - The caller must have allowed this contract to spend `underlyingAmount` tokens.
     *
     * @param underlyingAmount The amount of underlying to supply to the Redemption Pool.
     * @return bool true = success, otherwise it reverts.
     */
    function supplyUnderlying(uint256 underlyingAmount) external override nonReentrant returns (bool) {
        SupplyUnderlyingLocalVars memory vars;

        /* Checks: maturation time. */
        require(block.timestamp < fyToken.expirationTime(), "ERR_BOND_MATURED");

        /* Checks: the zero edge case. */
        require(underlyingAmount > 0, "ERR_SUPPLY_UNDERLYING_ZERO");

        /* Checks: the Fintroller allows this action to be performed. */
        require(fintroller.getSupplyUnderlyingAllowed(fyToken), "ERR_SUPPLY_UNDERLYING_NOT_ALLOWED");

        /* Effects: update storage. */
        (vars.mathErr, vars.newUnderlyingTotalSupply) = addUInt(totalUnderlyingSupply, underlyingAmount);
        require(vars.mathErr == MathError.NO_ERROR, "ERR_SUPPLY_UNDERLYING_MATH_ERROR");
        totalUnderlyingSupply = vars.newUnderlyingTotalSupply;

        /**
         * fyTokens always have 18 decimals so the underlying amount needs to be upscaled.
         * If the precision scalar is 1, it means that the underlying also has 18 decimals.
         */
        vars.underlyingPrecisionScalar = fyToken.underlyingPrecisionScalar();
        if (vars.underlyingPrecisionScalar != 1) {
            (vars.mathErr, vars.fyTokenAmount) = mulUInt(underlyingAmount, vars.underlyingPrecisionScalar);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_SUPPLY_UNDERLYING_MATH_ERROR");
        } else {
            vars.fyTokenAmount = underlyingAmount;
        }

        /* Interactions: mint the fyTokens. */
        require(fyToken.mint(msg.sender, vars.fyTokenAmount), "ERR_SUPPLY_UNDERLYING_CALL_MINT");

        /* Interactions: perform the Erc20 transfer. */
        fyToken.underlying().safeTransferFrom(msg.sender, address(this), underlyingAmount);

        emit SupplyUnderlying(msg.sender, underlyingAmount, vars.fyTokenAmount);

        return true;
    }

    /**
     * @notice Mark functions that require delegation to the underlying Pool
     */
    modifier needsBPool() {
        require(address(bPool) != address(0), "ERR_BPOOL_NOT_CREATED");
        _;
    }

    /**
     * @notice Activate or de-activate the admin lock for leveraged LP.
     *
     * Requirements:
     *
     * - Caller must be admin.
     *
     * @param newLock The new value to set the lock to.
     * @return true = admin lock is now activated, otherwise false.
     */
    function setLPAdminLock(bool newLock) external override onlyAdmin returns (bool) {
        /* Effects: update storage. */
        isLPAdminLocked = newLock;

        return isLPAdminLocked;
    }

    struct InjectLiquidityLocalVars {
        MathError mathErr;
        uint256 fyTokenAmount;
        uint256 underlyingAmountTotal;
        uint256 poolTokenAmountTotal;
        uint256 fyTokenAmountTotal;
        uint256 underlyingPrecisionScalar;
        uint256 poolShare;
        uint256 fyTokenAmountScaled;
        uint256 underlyingAmountScaled;
        uint256 fyTokenBpRatioScaled;
        uint256 underlyingBpRatioScaled;
        uint256 bpRatioScaled;
        uint256 poolTokenAmountScaled;
        uint256 poolTokenAmount;
        uint256 underlyingAmountReal;
        uint256[] maxAmountsIn;
    }

    /**
     * @notice Provides liquidity for the `underlying:fyToken` pair on Balancer by taking an underlying amount
     * from the user, minting the equivalent amount of fyTokens, and injecting that liquidity into the pair's
     * Balancer pool.
     *
     * @dev Emits an {InjectLiquidity} event.
     *
     * Requirements:
     *
     * - If admin lock is activated, caller must be admin.
     * - Must be called prior to maturation.
     * - The amount to supply cannot be zero.
     * - The caller must have allowed this contract to spend `underlyingAmount` tokens.
     *
     * @param underlyingAmount The amount of underlying tokens to use for injecting liquidity.
     * @return true = success, otherwise it reverts.
     */
    function injectLiquidity(uint256 underlyingAmount) external override nonReentrant returns (bool) {
        InjectLiquidityLocalVars memory vars;

        /* Checks: admin lock deactivated or caller is admin. */
        require(!isLPAdminLocked || msg.sender == admin, "ERR_NOT_ADMIN");

        /* Checks: maturation time. */
        require(block.timestamp < fyToken.expirationTime(), "ERR_BOND_MATURED");

        /* Checks: the zero edge case. */
        require(underlyingAmount > 0, "ERR_INJECT_LIQUIDITY_ZERO");

        /**
         * fyTokens always have 18 decimals so the underlying amount needs to be upscaled.
         * If the precision scalar is 1, it means that the underlying also has 18 decimals.
         */
        vars.underlyingPrecisionScalar = fyToken.underlyingPrecisionScalar();
        if (vars.underlyingPrecisionScalar != 1) {
            (vars.mathErr, vars.fyTokenAmount) = mulUInt(underlyingAmount, vars.underlyingPrecisionScalar);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");
        } else {
            vars.fyTokenAmount = underlyingAmount;
        }

        /* Interactions: mint the fyTokens. */
        require(fyToken.mint(address(this), vars.fyTokenAmount), "ERR_INJECT_LIQUIDITY_CALL_MINT");

        /* Interactions: perform the Erc20 transfer. */
        fyToken.underlying().safeTransferFrom(msg.sender, address(this), underlyingAmount);

        /* If the pool hasn't been created, create and initialize it before adding the new liquidity. */
        if (address(bPool) == address(0)) {
            BPoolInterface bp = BFactoryInterface(BFACTORY_ADDRESS).newBPool();

            /* Effects: approve infinite allowances for balancer pool (unsafe). */
            fyToken.underlying().approve(address(bp), type(uint256).max);
            fyToken.approve(address(bp), type(uint256).max);

            /* Effects: set pool weights (50/50) and supply the initial liquidity by providing token balances. */
            bp.bind(address(fyToken.underlying()), underlyingAmount, 25000000000000000000);
            bp.bind(address(fyToken), vars.fyTokenAmount, 25000000000000000000);

            /* Effects: finalize pool (set as public) and mint pool tokens to caller. */
            bp.finalize();

            /* Effects: update storage. */
            lpPositions[msg.sender].underlyingAmountTotal = underlyingAmount;

            /* Effects: update storage. */
            lpPositions[msg.sender].poolTokenAmountTotal = bp.balanceOf(address(this));

            emit InjectLiquidity(msg.sender, underlyingAmount, bp.balanceOf(address(this)));

            /* Effects: update storage. */
            bPool = bp;
        } else {
            /* Fails when trying to inject liquidity after all liquidity is extracted from the pool */
            require(bPool.balanceOf(address(this)) > 0, "ERR_INJECT_LIQUIDITY_EMPTY");

            /* Effects: absorb any tokens that may have been sent to the Balancer pool contract. */
            // TODO: determine if that is really necessary or if it opens up an attack vector
            bPool.gulp(address(fyToken.underlying()));
            bPool.gulp(address(fyToken));

            (vars.mathErr, vars.fyTokenAmountScaled) = mulUInt(vars.fyTokenAmount, RATIO_SCALE);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");

            (vars.mathErr, vars.underlyingAmountScaled) = mulUInt(underlyingAmount, RATIO_SCALE);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");

            (vars.mathErr, vars.fyTokenBpRatioScaled) = divUInt(
                vars.fyTokenAmountScaled,
                bPool.getBalance(address(fyToken))
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");

            (vars.mathErr, vars.underlyingBpRatioScaled) = divUInt(
                vars.underlyingAmountScaled,
                bPool.getBalance(address(fyToken.underlying()))
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");

            if (vars.fyTokenBpRatioScaled < vars.underlyingBpRatioScaled) {
                vars.bpRatioScaled = vars.fyTokenBpRatioScaled;
            } else {
                vars.bpRatioScaled = vars.underlyingBpRatioScaled;
            }

            (vars.mathErr, vars.poolTokenAmountScaled) = mulUInt(bPool.totalSupply(), vars.bpRatioScaled);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");

            (vars.mathErr, vars.poolTokenAmount) = divUInt(vars.poolTokenAmountScaled, RATIO_SCALE);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");

            vars.maxAmountsIn = new uint256[](2);
            vars.maxAmountsIn[0] = type(uint256).max;
            vars.maxAmountsIn[1] = type(uint256).max;

            vars.underlyingAmountReal = fyToken.underlying().balanceOf(address(this));

            /* Effects: provide liquidity to `underlying:fyToken` Balancer pool. */
            bPool.joinPool(vars.poolTokenAmount, vars.maxAmountsIn);

            (vars.mathErr, vars.underlyingAmountReal) = subUInt(
                vars.underlyingAmountReal,
                fyToken.underlying().balanceOf(address(this))
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");

            /* Effects: update storage. */
            (vars.mathErr, vars.underlyingAmountTotal) = addUInt(
                lpPositions[msg.sender].underlyingAmountTotal,
                vars.underlyingAmountReal
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");
            lpPositions[msg.sender].underlyingAmountTotal = vars.underlyingAmountTotal;

            /* Effects: update storage. */
            (vars.mathErr, vars.poolTokenAmountTotal) = addUInt(
                lpPositions[msg.sender].poolTokenAmountTotal,
                vars.poolTokenAmount
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_INJECT_LIQUIDITY_MATH_ERROR");
            lpPositions[msg.sender].poolTokenAmountTotal = vars.poolTokenAmountTotal;

            emit InjectLiquidity(msg.sender, vars.underlyingAmountReal, vars.poolTokenAmount);

            /* Interactions: burn all leftover fyTokens. */
            if (fyToken.balanceOf(address(this)) > 0) {
                require(
                    fyToken.burn(address(this), fyToken.balanceOf(address(this))),
                    "ERR_INJECT_LIQUIDITY_CALL_BURN"
                );
            }
        }

        return true;
    }

    struct ExtractLiquidityLocalVars {
        MathError mathErr;
        uint256 fyTokenAmount;
        uint256 fyTokenAmountRepay;
        uint256 poolTokenAmountTotal;
        uint256 underlyingAmountTotal;
        uint256 underlyingAmountReal;
        uint256 underlyingPrecisionScalar;
        uint256[] minAmountsOut;
    }

    /**
     * @notice Extracts liquidity previously provisioned to the Balancer pool.
     *
     * @dev Emits a {ExtractLiquidity} event.
     *
     * Requirements:
     *
     * - The amount to extract cannot be zero.
     * - The amount to extract cannot be larger that the sender's open position.
     *
     * @param poolTokenAmount The amount of pool tokens to extract from the Balancer
     *  pool liquidity.
     * @return true = success, otherwise it reverts.
     */
    function extractLiquidity(uint256 poolTokenAmount) external override nonReentrant needsBPool returns (bool) {
        ExtractLiquidityLocalVars memory vars;

        /* Checks: the zero edge case. */
        require(poolTokenAmount > 0, "EXTRACT_LIQUIDITY_ZERO");

        /* Checks: the insufficient position case. */
        require(
            poolTokenAmount <= lpPositions[msg.sender].poolTokenAmountTotal,
            "EXTRACT_LIQUIDITY_INSUFFICIENT_POSITION"
        );

        vars.minAmountsOut = new uint256[](2);
        vars.minAmountsOut[0] = 0;
        vars.minAmountsOut[1] = 0;

        vars.underlyingAmountReal = fyToken.underlying().balanceOf(address(this));

        bPool.exitPool(poolTokenAmount, vars.minAmountsOut);

        (vars.mathErr, vars.poolTokenAmountTotal) = subUInt(
            lpPositions[msg.sender].poolTokenAmountTotal,
            poolTokenAmount
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_EXTRACT_LIQUIDITY_MATH_ERROR");
        lpPositions[msg.sender].poolTokenAmountTotal = vars.poolTokenAmountTotal;

        (vars.mathErr, vars.underlyingAmountReal) = subUInt(
            fyToken.underlying().balanceOf(address(this)),
            vars.underlyingAmountReal
        );
        require(vars.mathErr == MathError.NO_ERROR, "ERR_EXTRACT_LIQUIDITY_MATH_ERROR");

        if (vars.underlyingAmountReal < lpPositions[msg.sender].underlyingAmountTotal) {
            (vars.mathErr, vars.fyTokenAmountRepay) = subUInt(
                lpPositions[msg.sender].underlyingAmountTotal,
                vars.underlyingAmountReal
            );
            require(vars.mathErr == MathError.NO_ERROR, "ERR_EXTRACT_LIQUIDITY_MATH_ERROR");

            vars.underlyingPrecisionScalar = fyToken.underlyingPrecisionScalar();

            (vars.mathErr, vars.fyTokenAmountRepay) = mulUInt(vars.fyTokenAmountRepay, vars.underlyingPrecisionScalar);
            require(vars.mathErr == MathError.NO_ERROR, "ERR_EXTRACT_LIQUIDITY_MATH_ERROR");

            // Mint instead of transfer even though there are excess tokens in this case to avoid math issues
            /* Interactions: mint the fyTokens. */
            require(fyToken.mint(address(msg.sender), vars.fyTokenAmount), "ERR_INJECT_LIQUIDITY_CALL_MINT");
        } else if (vars.underlyingAmountReal >= lpPositions[msg.sender].underlyingAmountTotal) {
            fyToken.underlying().transfer(msg.sender, lpPositions[msg.sender].underlyingAmountTotal);

            lpPositions[msg.sender].underlyingAmountTotal = 0;
        }

        /* Interactions: burn all leftover fyTokens. */
        if (fyToken.balanceOf(address(this)) > 0) {
            require(fyToken.burn(address(this), fyToken.balanceOf(address(this))), "ERR_EXTRACT_LIQUIDITY_CALL_BURN");
        }

        emit ExtractLiquidity(msg.sender, vars.underlyingAmountReal, poolTokenAmount);

        return true;
    }
}
