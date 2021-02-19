import { expect } from "chai";

export default function shouldBehaveLikeCollateralsGetter(): void {
  it("retrieves the contract address of the collaterals", async function () {
    const collateralAddresses: string[] = await this.contracts.fyToken.getCollaterals();
    expect(collateralAddresses).to.eql(this.stubs.collaterals.map((collateral) => collateral.address));
  });
}
