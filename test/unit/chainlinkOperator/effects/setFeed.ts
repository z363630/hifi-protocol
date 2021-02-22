import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { AdminErrors, ChainlinkOperatorErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeSetFeed(): void {
  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
        await expect(
          this.contracts.oracle
            .connect(this.signers.raider)
            .setFeed(this.stubs.collaterals[i].address, this.stubs.collateralPriceFeeds[i].address),
        ).to.be.revertedWith(AdminErrors.NotAdmin);
      }
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the feed does not have 8 decimals", function () {
      beforeEach(async function () {
        for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
          await this.stubs.collateralPriceFeeds[i].mock.decimals.returns(BigNumber.from(6));
        }
      });

      it("reverts", async function () {
        for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
          await expect(
            this.contracts.oracle
              .connect(this.signers.admin)
              .setFeed(this.stubs.collaterals[i].address, this.stubs.collateralPriceFeeds[i].address),
          ).to.be.revertedWith(ChainlinkOperatorErrors.FeedIncorrectDecimals);
        }
      });
    });

    describe("when the feed has 8 decimals", function () {
      it("sets the feed", async function () {
        for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
          await this.contracts.oracle
            .connect(this.signers.admin)
            .setFeed(this.stubs.collaterals[i].address, this.stubs.collateralPriceFeeds[i].address);
        }

        const feed = await this.contracts.oracle.getFeed("WETH");
        expect(feed[0]).to.equal(this.stubs.collaterals[0].address); /* asset */
        expect(feed[1]).to.equal(this.stubs.collateralPriceFeeds[0].address); /* id */
        expect(feed[2]).to.equal(true); /* isSet */

        const feedXYZ = await this.contracts.oracle.getFeed("XYZ");
        expect(feedXYZ[0]).to.equal(this.stubs.collaterals[1].address); /* asset */
        expect(feedXYZ[1]).to.equal(this.stubs.collateralPriceFeeds[1].address); /* id */
        expect(feedXYZ[2]).to.equal(true); /* isSet */
      });

      it("emits a SetFeed event", async function () {
        for (let i = 0; i < this.stubs.collaterals.length; i += 1) {
          await expect(
            this.contracts.oracle
              .connect(this.signers.admin)
              .setFeed(this.stubs.collaterals[i].address, this.stubs.collateralPriceFeeds[i].address),
          )
            .to.emit(this.contracts.oracle, "SetFeed")
            .withArgs(this.stubs.collaterals[i].address, this.stubs.collateralPriceFeeds[i].address);
        }
      });
    });
  });
}
