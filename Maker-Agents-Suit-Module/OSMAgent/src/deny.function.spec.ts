import { Finding, HandleTransaction, FindingSeverity, FindingType, TransactionEvent } from "forta-agent";
import provideDenyFunctionHandler, { DENY_FUNCTION_SIG } from "./deny.function";
import { createAddress, TestTransactionEvent } from "forta-agent-tools/lib/tests";
import { when } from "jest-when";
import { utils } from "ethers";

const CONTRACTS: string[][] = [
  // index represent a timestamp
  [], // no contracts at timestamp 0
  [createAddress("0xa0"), createAddress("0xa1")],
  [createAddress("0xb0"), createAddress("0xb1"), createAddress("0xb2")],
  [createAddress("0xc0")],
];
const ADDRESSES = [createAddress("0x1"), createAddress("0x2"), createAddress("0x3")];
const denyIface = new utils.Interface([DENY_FUNCTION_SIG]);

export const createFinding = (to: string, address: string) => {
  return Finding.fromObject({
    name: "Maker OSM DENY Function",
    description: "DENY Function is called",
    alertId: "MakerDAO-OSM-2",
    severity: FindingSeverity.Medium,
    type: FindingType.Info,
    protocol: "Maker",
    metadata: {
      contract: to,
      deniedAddress: address,
    },
  });
};

describe("OSM Rely Function Agent", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    const mockFetcher: any = { get: jest.fn() };
    handleTransaction = provideDenyFunctionHandler(mockFetcher);

    when(mockFetcher.get).calledWith(1).mockReturnValue(CONTRACTS[1]);
    when(mockFetcher.get).calledWith(2).mockReturnValue(CONTRACTS[2]);
    when(mockFetcher.get).calledWith(3).mockReturnValue(CONTRACTS[3]);
  });

  it("should return a finding for one of the OSM contract", async () => {
    const _from = createAddress("0x2");
    const _to = CONTRACTS[1][0];
    const _input: string = denyIface.encodeFunctionData("deny", [ADDRESSES[0]]);

    const txEvent: TransactionEvent = new TestTransactionEvent().setTimestamp(1).setTo(_to).addTraces({
      to: _to,
      from: _from,
      input: _input,
    });

    const findings: Finding[] = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([createFinding(_to, ADDRESSES[0])]);
  });

  it("should return multiple findings", async () => {
    const _from = createAddress("0x2");
    const _input: string = denyIface.encodeFunctionData("deny", [ADDRESSES[0]]);
    const _input2: string = denyIface.encodeFunctionData("deny", [ADDRESSES[1]]);

    const txEvent: TransactionEvent = new TestTransactionEvent().setTimestamp(2).setTo(CONTRACTS[2][2]).addTraces(
      {
        to: CONTRACTS[2][2],
        from: _from,
        input: _input,
      },
      {
        to: CONTRACTS[2][2],
        from: _from,
        input: _input2,
      }
    );

    const findings: Finding[] = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      createFinding(CONTRACTS[2][2], ADDRESSES[0]),
      createFinding(CONTRACTS[2][2], ADDRESSES[1]),
    ]);
  });

  it("should return empty finding when OSM contract address does found", async () => {
    const _from = createAddress("0x2");
    const _to = createAddress("0x1"); // BAD ADDRESS
    const _input: string = denyIface.encodeFunctionData("deny", [ADDRESSES[2]]);

    const txEvent: TransactionEvent = new TestTransactionEvent().setTimestamp(3).setTo(CONTRACTS[2][2]).addTraces({
      to: _to,
      from: _from,
      input: _input,
    });

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });
});
