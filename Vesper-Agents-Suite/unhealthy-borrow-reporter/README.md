# XY strategy borrow more than borrowUpperBound limit or when Maker strategy is lowWater

## Description

This agent detects when a XY Strategy borrow higher than borrowUpperBound limit (Compound or Aave) or when Maker strategy is lowWater


## Alerts

- Vesper
  - Fired when XY strategy borrow more than borrowUpperBound limit or Maker strategy is lowWater
  - Severity is always set to "Critical".
  - Type is always set to "Info".
  - You can find the following information in the description:
    - `network` : Network Name
    - `strategyName` : Strategy Name
    - `strategyAddress`: Address of the strategy reporting high borrow
    - `poolName` : Vesper Pool name
    - `poolAddress` : Vesper Pool address
