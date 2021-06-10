import shouldBehaveLikeListBond from "./effects/listBond";
import shouldBehaveLikeListCollateral from "./effects/listCollateral";
import shouldBehaveLikeSetBorrowAllowed from "./effects/setBorrowAllowed";
import shouldBehaveLikeSetCollateralizationRatio from "./effects/setCollateralizationRatio";
import shouldBehaveLikeSetDebtCeiling from "./effects/setDebtCeiling";
import shouldBehaveLikeSetDepositCollateralAllowed from "./effects/setDepositCollateralAllowed";
import shouldBehaveLikeSetLiquidateBorrowAllowed from "./effects/setLiquidateBorrowAllowed";
import shouldBehaveLikeSetLiquidationIncentive from "./effects/setLiquidationIncentive";
import shouldBehaveLikeSetMaxBonds from "./effects/setMaxBonds";
import shouldBehaveLikeSetRepayBorrowAllowed from "./effects/setRepayBorrowAllowed";
import shouldBehaveLikeGetBond from "./view/getBond";
import shouldBehaveLikeGetBorrowAllowed from "./view/getBorrowAllowed";
import shouldBehaveLikeGetCollateral from "./view/getCollateral";
import shouldBehaveLikeGetCollateralizationRatio from "./view/getCollateralizationRatio";
import shouldBehaveLikeGetDebtCeiling from "./view/getDebtCeiling";
import shouldBehaveLikeGetDepositCollateralAllowed from "./view/getDepositCollateralAllowed";
import shouldBehaveLikeGetLiquidateBorrowAllowed from "./view/getLiquidateBorrowAllowed";
import shouldBehaveLikeGetLiquidationIncentive from "./view/getLiquidationIncentive";
import shouldBehaveLikeGetRepayBorrowAllowed from "./view/getRepayBorrowAllowed";
import shouldBehaveLikeIsBondListed from "./view/isBondListed";
import shouldBehaveLikeIsCollateralListed from "./view/isCollateralListed";
import shouldBehaveLikeMaxBonds from "./view/maxBonds";

export function shouldBehaveLikeFintroller(): void {
  it("works", async function () {
    const fintrollerProxyAddress: string = this.contracts.fintroller.address;
    console.log({ fintrollerProxyAddress });

    // const fintrollerImplementationAddress: string = await this.contracts.fintroller
    //   .connect(this.signers.admin)
    //   .implementation();
    // console.log({ fintrollerImplementationAddress });

    const fintrollerInterface = this.contracts.fintroller.interface;
    console.log({ fintrollerInterface });
  });
}
export function shouldBehaveLikeFintrollerV2(): void {
  describe("View Functions", function () {
    describe("getBond", function () {
      shouldBehaveLikeGetBond();
    });

    describe("getBorrowAllowed", function () {
      shouldBehaveLikeGetBorrowAllowed();
    });

    describe("getCollateral", function () {
      shouldBehaveLikeGetCollateral();
    });

    describe("getCollateralizationRatio", function () {
      shouldBehaveLikeGetCollateralizationRatio();
    });

    describe("getDebtCeiling", function () {
      shouldBehaveLikeGetDebtCeiling();
    });

    describe("getDepositCollateralAllowed", function () {
      shouldBehaveLikeGetDepositCollateralAllowed();
    });

    describe("getLiquidateBorrowAllowed", function () {
      shouldBehaveLikeGetLiquidateBorrowAllowed();
    });

    describe("getLiquidationIncentive", function () {
      shouldBehaveLikeGetLiquidationIncentive();
    });

    describe("getRepayBorrowAllowed", function () {
      shouldBehaveLikeGetRepayBorrowAllowed();
    });

    describe("isBondListed", function () {
      shouldBehaveLikeIsBondListed();
    });

    describe("isCollateralListed", function () {
      shouldBehaveLikeIsCollateralListed();
    });

    describe("maxBonds", function () {
      shouldBehaveLikeMaxBonds();
    });
  });

  describe("Effects Functions", function () {
    describe("listBond", function () {
      shouldBehaveLikeListBond();
    });

    describe("listCollateral", function () {
      shouldBehaveLikeListCollateral();
    });

    describe("setBorrowAllowed", function () {
      shouldBehaveLikeSetBorrowAllowed();
    });

    describe("setCollateralizationRatio", function () {
      shouldBehaveLikeSetCollateralizationRatio();
    });

    describe("setDebtCeiling", function () {
      shouldBehaveLikeSetDebtCeiling();
    });

    describe("setDepositCollateralAllowed", function () {
      shouldBehaveLikeSetDepositCollateralAllowed();
    });

    describe("setLiquidateBorrowAllowed", function () {
      shouldBehaveLikeSetLiquidateBorrowAllowed();
    });

    describe("setLiquidationIncentive", function () {
      shouldBehaveLikeSetLiquidationIncentive();
    });

    describe("setMaxBonds", function () {
      shouldBehaveLikeSetMaxBonds();
    });

    describe("setRepayBorrowAllowed", function () {
      shouldBehaveLikeSetRepayBorrowAllowed();
    });
  });
}
