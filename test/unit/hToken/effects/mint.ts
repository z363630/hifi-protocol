import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";

import { HTokenErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetVaultDebt(): void {
  const mintAmount: BigNumber = fp("100");

  context("when the caller is not the HToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.hTokens[0].connect(this.signers.raider).mint(this.signers.raider.address, mintAmount),
      ).to.be.revertedWith(HTokenErrors.MintNotAuthorized);
    });
  });
}
