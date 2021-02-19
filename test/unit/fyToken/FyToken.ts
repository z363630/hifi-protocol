import { shouldBehaveLikeFyToken } from "./FyToken.behavior";
import { unitFixtureFyToken } from "../fixtures";

export function unitTestFyToken(): void {
  describe("FyToken", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        collaterals,
        fintroller,
        oracle,
        redemptionPool,
        underlying,
        fyToken,
      } = await this.loadFixture(unitFixtureFyToken);
      this.contracts.fyToken = fyToken;
      this.stubs.balanceSheet = balanceSheet;
      this.stubs.collaterals = collaterals;
      this.stubs.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.redemptionPool = redemptionPool;
      this.stubs.underlying = underlying;
    });

    shouldBehaveLikeFyToken();
  });
}
