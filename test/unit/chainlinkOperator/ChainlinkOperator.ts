import { shouldBehaveLikeChainlinkOperator } from "./ChainlinkOperator.behavior";
import { unitFixtureChainlinkOperator } from "../fixtures";

export function unitTestChainlinkOperator(): void {
  describe("ChainlinkOperator", function () {
    beforeEach(async function () {
      const { collaterals, collateralPriceFeeds, oracle } = await this.loadFixture(unitFixtureChainlinkOperator);
      this.contracts.oracle = oracle;
      this.stubs.collaterals = collaterals;
      this.stubs.collateralPriceFeeds = collateralPriceFeeds;
    });

    shouldBehaveLikeChainlinkOperator();
  });
}
