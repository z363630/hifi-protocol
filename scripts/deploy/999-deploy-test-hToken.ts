import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { utils } from "ethers";
import { ethers } from "hardhat";

async function main(): Promise<void> {
  // Fintroller
  const fintrollerFactory: ContractFactory = await ethers.getContractFactory("Fintroller");
  const fintroller: Contract = await fintrollerFactory.deploy();
  await fintroller.deployed();

  // BalanceSheet
  const balanceSheetFactory: ContractFactory = await ethers.getContractFactory("BalanceSheet");
  const balanceSheet: Contract = await balanceSheetFactory.deploy(fintroller.address);
  await balanceSheet.deployed();

  // Underlying
  const underlyingFactory: ContractFactory = await ethers.getContractFactory("Erc20Mintable");
  const underlying: Contract = await underlyingFactory.deploy("ABC", "ABC", 18);
  await underlying.deployed();

  // Collateral
  const collateralFactory: ContractFactory = await ethers.getContractFactory("Erc20Mintable");
  const collateral: Contract = await collateralFactory.deploy("ABC", "ABC", 18);
  await collateral.deployed();

  // FyToken
  const FyTokenFactory: ContractFactory = await ethers.getContractFactory("FyToken");
  const fyToken: Contract = await FyTokenFactory.deploy(
    "fyToken",
    "fyToken",
    "1650120856",
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  );
  await fyToken.deployed();

  const fyTokenReceipt = await fyToken.deployTransaction.wait();
  const fyTokenCost = fyTokenReceipt.cumulativeGasUsed.mul(ethers.utils.parseUnits('100', 'gwei'));
  console.log('fyToken deployment costs:', ethers.utils.formatEther(fyTokenCost));

  // HToken
  const HTokenFactory: ContractFactory = await ethers.getContractFactory("HToken");
  const hToken: Contract = await HTokenFactory.deploy(
    "hToken",
    "HTOKEN",
    "1650120856",
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  );
  await hToken.deployed();

  const hTokenReceipt = await hToken.deployTransaction.wait();
  const hTokenCost = hTokenReceipt.cumulativeGasUsed.mul(ethers.utils.parseUnits('100', 'gwei'));
  console.log('hToken deployment costs:', ethers.utils.formatEther(hTokenCost));

  // HTokenFactory
  const hTokenFactoryFactory: ContractFactory = await ethers.getContractFactory("HTokenFactory");
  const hTokenFactory: Contract = await hTokenFactoryFactory.deploy();
  await hTokenFactory.deployed();

  const hTokenFactoryReceipt = await hTokenFactory.deployTransaction.wait();
  const hTokenFactoryCost = hTokenFactoryReceipt.cumulativeGasUsed.mul(ethers.utils.parseUnits('100', 'gwei'));
  console.log('hToken Factory deployment costs:', ethers.utils.formatEther(hTokenFactoryCost));

  const tx = await hTokenFactory.deployHToken(
    hToken.address,
    "Clone 0",
    "Clone0",
    "1650120856",
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  );

  const receipt: TransactionReceipt = await tx.wait();
  const cost = receipt.gasUsed.mul(utils.parseUnits('100', 'gwei'));
  console.log('Cloning hToken costs:', utils.formatEther(cost));
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
