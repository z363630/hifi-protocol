import { baseContext } from "../shared/contexts";
import { unitTestBalanceSheet } from "./balanceSheet/BalanceSheet";
import { unitTestChainlinkOperator } from "./chainlinkOperator/ChainlinkOperator";
import { unitTestFintroller } from "./fintroller/Fintroller";
import { unitTestHToken } from "./hToken/HToken";

baseContext("Unit Tests", function () {
  unitTestBalanceSheet();
  unitTestChainlinkOperator();
  unitTestFintroller();
  unitTestHToken();
});
