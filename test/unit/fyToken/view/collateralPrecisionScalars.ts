import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FyToken } from "../../../../typechain/FyToken";
import { deployFyToken } from "../../../deployers";
import { fyTokenConstants, precisionScalars } from "../../../../helpers/constants";

export default function shouldBehaveLikeCollateralPrecisionScalarGetter(): void {
  describe("when the collateral has 18 decimals", function () {
    beforeEach(async function () {
      for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
        await this.stubs.collaterals[i].mock.decimals.returns(BigNumber.from(18));
      }
    });

    it("retrieves 1", async function () {
      for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
        const collateralPrecisionScalar: BigNumber = await this.contracts.fyToken.collateralPrecisionScalars(this.stubs.collaterals[i].address);
        expect(collateralPrecisionScalar).to.equal(precisionScalars.tokenWith18Decimals);
      }
    });
  });

  describe("when the collateral has 8 decimals", function () {
    beforeEach(async function () {
      for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
        await this.stubs.collaterals[i].mock.decimals.returns(BigNumber.from(8));
      }
    });

    it("retrieves 1.0e10", async function () {
      const fyToken: FyToken = await deployFyToken(
        this.signers.admin,
        fyTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collaterals.map((collateral) => collateral.address),
      );

      for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
        const collateralPrecisionScalar: BigNumber = await fyToken.collateralPrecisionScalars(this.stubs.collaterals[i].address);
        expect(collateralPrecisionScalar).to.equal(precisionScalars.tokenWith8Decimals);
      }
    });
  });
}
