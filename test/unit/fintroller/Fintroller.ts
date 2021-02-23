import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";
import { unitFixtureFintroller } from "../fixtures";

export function unitTestFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller, fyToken, collaterals, oracle } = await this.loadFixture(unitFixtureFintroller);
      this.contracts.fintroller = fintroller;
      this.stubs.fyToken = fyToken;
      this.stubs.oracle = oracle;
      this.stubs.collaterals = collaterals;
    });

    shouldBehaveLikeFintroller();
  });
}
