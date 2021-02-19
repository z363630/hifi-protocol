import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../../helpers/errors";
import { percentages, precisionScalars, tokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetClutchableCollateral(): void {
  /* 0.5 = 50 (repay amount) * 1.1 (liquidation incentive) * 1.0 (underlying price) / 100 (collateral price) */
  const clutchableCollateralAmount: BigNumber = tokenAmounts.pointFiftyFive;
  const repayAmount: BigNumber = tokenAmounts.fifty;

  describe("when the amount to repay is zero", function () {
    it("reverts", async function () {
      for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
        await expect(
          this.contracts.balanceSheet.getClutchableCollateral(this.stubs.fyToken.address, this.stubs.collaterals[i].address, Zero),
        ).to.be.revertedWith(BalanceSheetErrors.GetClutchableCollateralZero);
      }
    });
  });

  describe("when the amount to repay is not zero", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.liquidationIncentiveMantissa.returns(percentages.oneHundredAndTen);
    });

    describe("when the liquidation incentive is zero", function () {
      beforeEach(async function () {
        await this.stubs.fintroller.mock.liquidationIncentiveMantissa.returns(Zero);
      });

      it("retrieves zero", async function () {
        for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
          const clutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
            this.stubs.fyToken.address,
            this.stubs.collaterals[i].address,
            repayAmount,
          );
          expect(clutchableCollateralAmount).to.equal(Zero);
        }
      });
    });

    describe("when the liquidation incentive is not zero", function () {
      describe("when the collateral has 18 decimals", function () {
        beforeEach(async function () {
          for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
            await this.stubs.collaterals[i].mock.decimals.returns(BigNumber.from(18));
            await this.stubs.fyToken.mock.collateralPrecisionScalars.withArgs(this.stubs.collaterals[i].address).returns(precisionScalars.tokenWith18Decimals);
          }
        });

        it("retrieves the clutchable collateral amount", async function () {
          for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
            const contractClutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
              this.stubs.fyToken.address,
              this.stubs.collaterals[i].address,
              repayAmount,
            );
            expect(contractClutchableCollateralAmount).to.equal(clutchableCollateralAmount);
          }
        });
      });

      describe("when the collateral has 8 decimals", function () {
        beforeEach(async function () {
          for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
            await this.stubs.collaterals[i].mock.decimals.returns(BigNumber.from(8));
            await this.stubs.fyToken.mock.collateralPrecisionScalars.withArgs(this.stubs.collaterals[i].address).returns(precisionScalars.tokenWith8Decimals);
          }
        });

        it("retrieves the downscaled clutchable collateral amount", async function () {
          const downscaledClutchableCollateralAmount = clutchableCollateralAmount.div(
            precisionScalars.tokenWith8Decimals,
          );

          for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
            const contractClutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
              this.stubs.fyToken.address,
              this.stubs.collaterals[i].address,
              repayAmount,
            );
            expect(contractClutchableCollateralAmount).to.equal(downscaledClutchableCollateralAmount);
          }
        });
      });
    });
  });
}
