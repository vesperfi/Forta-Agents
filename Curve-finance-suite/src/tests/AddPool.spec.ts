import {
  Finding,
  HandleTransaction,
  FindingSeverity,
  FindingType,
  TransactionEvent,
} from "forta-agent";
import provideAddPoolAgent, { ADD_POOL_SIGNATURE } from "../agents/AddPool";
import createTxEventWithLog from "../utils/createEventLog";

const ADDRESS = "0X1111";
const ALERT_ID = "test";

describe("Add Pool agent", () => {
  let handleTransactions: HandleTransaction;

  beforeAll(() => {
    handleTransactions = provideAddPoolAgent(ALERT_ID, ADDRESS);
  });

  it("should create a findings", async () => {
    const txEvent: TransactionEvent = createTxEventWithLog(
      ADD_POOL_SIGNATURE,
      ADDRESS
    );

    const findings = await handleTransactions(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Add Pool",
        description: "New Pool Added",
        alertId: ALERT_ID,
        severity: FindingSeverity.Info,
        type: FindingType.Unknown,
      }),
    ]);
  });
});
