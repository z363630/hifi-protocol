import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import {
  H_TOKEN_EXPIRATION_TIME,
  TOKEN_WITH_18_DECIMALS_PRECISION_SCALAR,
  TOKEN_WITH_8_DECIMALS_PRECISION_SCALAR,
} from "../../../../helpers/constants";
import { bn } from "../../../../helpers/numbers";
import { HToken } from "../../../../typechain/HToken";
import { deployHToken } from "../../../deployers";

export default function shouldBehaveLikeCollateralPrecisionScalarGetter(): void {
  context("when the collateral has 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(bn("18"));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_EXPIRATION_TIME,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const collateralPrecisionScalar: BigNumber = await hToken.collateralPrecisionScalar();
      expect(collateralPrecisionScalar).to.equal(TOKEN_WITH_18_DECIMALS_PRECISION_SCALAR);
    });
  });

  context("when the collateral has 8 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(bn("8"));
    });

    it("retrieves 1.0e10", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_EXPIRATION_TIME,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const collateralPrecisionScalar: BigNumber = await hToken.collateralPrecisionScalar();
      expect(collateralPrecisionScalar).to.equal(TOKEN_WITH_8_DECIMALS_PRECISION_SCALAR);
    });
  });
}
