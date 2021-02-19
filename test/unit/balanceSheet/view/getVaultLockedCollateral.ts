import { BigNumber } from "@ethersproject/bignumber";
import { Zero, AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetVaultLockedCollateral(): void {
  describe("when the bond is not open", function () {
    it("retrieves the default value", async function () {
      const vaultLockedCollateral = await this.contracts.balanceSheet.getVaultLockedCollateral(
        this.stubs.fyToken.address,
        this.accounts.borrower,
      );
      expect(vaultLockedCollateral[0]).to.equal(AddressZero);
      expect(vaultLockedCollateral[1]).to.equal(Zero);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address);
    });

    it("retrieves the default value", async function () {
      const vaultLockedCollateral = await this.contracts.balanceSheet.getVaultLockedCollateral(
        this.stubs.fyToken.address,
        this.accounts.borrower,
      );
      expect(vaultLockedCollateral[0]).to.equal(AddressZero);
      expect(vaultLockedCollateral[1]).to.equal(Zero);
    });
  });
}
