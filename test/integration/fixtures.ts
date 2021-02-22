import { Signer } from "@ethersproject/abstract-signer";

import { ChainlinkOperator } from "../../typechain/ChainlinkOperator";
import { Erc20Mintable } from "../../typechain/Erc20Mintable";
import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeFyToken } from "../../typechain/GodModeFyToken";
import { GodModeRedemptionPool } from "../../typechain/GodModeRedemptionPool";
import { SimplePriceFeed } from "../../typechain/SimplePriceFeed";
import {
  deployChainlinkOperator,
  deployCollateralABC,
  deployCollateralXYZ,
  deployCollateralABCPriceFeed,
  deployCollateralXYZPriceFeed,
  deployFintroller,
  deployGodModeBalanceSheet,
  deployGodModeFyToken,
  deployGodModeRedemptionPool,
  deployUnderlying,
  deployUnderlyingPriceFeed,
} from "../deployers";
import { fyTokenConstants } from "../../helpers/constants";

type IntegrationFixtureReturnType = {
  balanceSheet: GodModeBalanceSheet;
  collaterals: Erc20Mintable[];
  collateralPriceFeeds: SimplePriceFeed[];
  fintroller: Fintroller;
  fyToken: GodModeFyToken;
  oracle: ChainlinkOperator;
  redemptionPool: GodModeRedemptionPool;
  underlying: Erc20Mintable;
  underlyingPriceFeed: SimplePriceFeed;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const collateralABC: Erc20Mintable = await deployCollateralABC(deployer);
  const collateralXYZ: Erc20Mintable = await deployCollateralXYZ(deployer);
  const collaterals = [collateralABC, collateralXYZ];

  const underlying: Erc20Mintable = await deployUnderlying(deployer);

  const collateralABCPriceFeed: SimplePriceFeed = await deployCollateralABCPriceFeed(deployer);
  const collateralXYZPriceFeed: SimplePriceFeed = await deployCollateralXYZPriceFeed(deployer);
  const collateralPriceFeeds = [collateralABCPriceFeed, collateralXYZPriceFeed];


  const underlyingPriceFeed: SimplePriceFeed = await deployUnderlyingPriceFeed(deployer);
  const oracle: ChainlinkOperator = await deployChainlinkOperator(deployer);
  await oracle.setFeed(collateralABC.address, collateralABCPriceFeed.address);
  await oracle.setFeed(collateralXYZ.address, collateralXYZPriceFeed.address);
  await oracle.setFeed(underlying.address, underlyingPriceFeed.address);

  const fintroller: Fintroller = await deployFintroller(deployer);
  await fintroller.connect(deployer).setOracle(oracle.address);

  const balanceSheet: GodModeBalanceSheet = await deployGodModeBalanceSheet(deployer, fintroller.address);

  /* Override the RedemptionPool.sol contract created by the fyToken with GodModeRedemptionPool.sol */
  const fyToken: GodModeFyToken = await deployGodModeFyToken(
    deployer,
    fyTokenConstants.expirationTime,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    [collateralABC.address, collateralXYZ.address],
  );

  const redemptionPool: GodModeRedemptionPool = await deployGodModeRedemptionPool(
    deployer,
    fintroller.address,
    fyToken.address,
  );
  await fyToken.__godMode__setRedemptionPool(redemptionPool.address);

  return {
    balanceSheet,
    collaterals,
    collateralPriceFeeds,
    fintroller,
    fyToken,
    oracle,
    redemptionPool,
    underlying,
    underlyingPriceFeed,
  };
}
