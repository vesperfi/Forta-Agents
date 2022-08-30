import { Finding, FindingType, FindingSeverity } from "forta-agent";

export const createFinding = (metadata: any): Finding => {
  return Finding.fromObject({
    name: "Strategy borrow more than allowed limit.",
    description:
      "Strategy borrow more than allowed limit. " + objToString(metadata),
    alertId: "Vesper",
    type: FindingType.Info,
    severity: FindingSeverity.Critical,
    protocol: "Vesper",
    metadata
  });
};

const objToString = (obj: any): string => {
  return Object.entries(obj).reduce((str, [p, val]) => {
    return `${str}${p}: ${val}\n `;
  }, '');
}

export const contains = (array: string[], name: string): any => {
  return array.some(element => {
    if (name.toLowerCase().includes(element.toLowerCase())) {
      return true;
    }
    return false;
  });
}