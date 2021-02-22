import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetFeed(): void {
  describe("when the feed is not set", function () {
    it("retrieves the default values", async function () {
      const feed = await this.contracts.oracle.getFeed("FOO");
      expect(feed[0]).to.equal(AddressZero); /* asset */
      expect(feed[1]).to.equal(AddressZero); /* id */
      expect(feed[2]).to.equal(false); /* isSet */
    });
  });

  describe("when the feed is set", function () {
    beforeEach(async function () {
      for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
        await this.contracts.oracle
          .connect(this.signers.admin)
          .setFeed(this.stubs.collaterals[i].address, this.stubs.collateralPriceFeeds[i].address);
      }
    });

    it("retrieves the storage properties of the feed", async function () {
      const feed = await this.contracts.oracle.getFeed("WETH");
      expect(feed[0]).to.equal(this.stubs.collaterals[0].address); /* asset */
      expect(feed[1]).to.equal(this.stubs.collateralPriceFeeds[0].address); /* id */
      expect(feed[2]).to.equal(true); /* isSet */

      const feedXYZ = await this.contracts.oracle.getFeed("XYZ");
      expect(feedXYZ[0]).to.equal(this.stubs.collaterals[1].address); /* asset */
      expect(feedXYZ[1]).to.equal(this.stubs.collateralPriceFeeds[1].address); /* id */
      expect(feedXYZ[2]).to.equal(true); /* isSet */
    });
  });
}
