# EVM Simulator

## Abstract
EVM Simulator is a tools to simulate EVM blockchain transaction without really sending them to the network. 
This is done by running a local "soft" fork or any EVM chain and sending the transaction locally in order to process its logs and the opcodes that were executed.

A simulated transaction can be done from any to any address without needing the source EOA keys.

## Quick start
```shell
npm i -g evm-simulator
evm-simulator --help
```

## Simulation flow
EVM Simulator is using Ganache to run a local fork of the EVM chain.
It then, unlocks the source EOA and sends the transaction to the local fork. 
Upon receiving the transaction, Ganache will process it and return the logs and the opcodes that were executed using the `debug_traceTransaction` RPC method.

opcodes are then processed in order to catch internal transfers while 
logs emitted by smart contract events are decoded to human-readable data using their ABI (fetched from [openchain.xyz](http://openchain.xyz) using their signature).    

## Usage 
```shell
EVM Simulator

Options:
  -V, --version               output the version number
  -c, --chain  [value]        Chain id (default: "1")
  -b, --blockheight  [value]  Block height to fork from
  --rpc  [value]              Chain rpc (default: "https://ethereum.publicnode.com")
  --from  [value]             Source EOA
  --to  [value]               Transaction target
  --value  [value]            Sent ETH value (in ETH)
  --data  [value]             Contract call data (hex string)
  -h, --help                  display help for command

```

## Output
A successful simulation returns a `SimulationResult` object.
```typescript
export class SimulationResult {
    from: string;
    to: string;

    gasUsed: BigNumber;
    cumulativeGasUsed: BigNumber;
    effectiveGasPrice: BigNumber;

    baseAssetTransfer?: TransferEvent;
    internalTransfers?: TransferEvent[];

    logs: object[];
}

export class TransferEvent {
    from: string;
    to: string;
    value: string;
}
```

## Example
Here is an example from a real [transaction](https://etherscan.io/tx/0xbcec995cfadc8fabf2b2c87b41ffb7ae287344da47da99fd0ff968fefd9dd989) (hash: `0xbcec995cfadc8fabf2b2c87b41ffb7ae287344da47da99fd0ff968fefd9dd989`) on the Ethereum mainnet.

### Input 
```shell
yarn start \
--from 0x156f058c67a22f96076ce8dabe14d40a90f971ee \
--to 0x7a250d5630b4cf539739df2c5dacb4c659f2488d \
--value 0.0055 \
-c 1 \
-b 17136115 \
--data 0x7ff36ab500000000000000000000000000000000000000000000000000000d80a111d6aa0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000156f058c67a22f96076ce8dabe14d40a90f971ee00000000000000000000000000000000000000000000000000000000644a2c720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000033cb1438e2443cdb44b18d6f2de1491d1f77a8ee \
--rpc https://mainnet.infura.io/v3/<api_key>
```

### Output
```json
{
  "internalTransfers": [
    {
      "from": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      "to": "000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "value": "5500000000000000"
    }
  ],
  "baseAssetTransfer": {
    "from": "0x156f058C67A22f96076CE8DabE14d40a90f971eE",
    "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "value": "5500000000000000"
  },
  "from": "0x156f058C67A22f96076CE8DabE14d40a90f971eE",
  "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  "gasUsed": {
    "type": "BigNumber",
    "hex": "0x021c21"
  },
  "cumulativeGasUsed": {
    "type": "BigNumber",
    "hex": "0x021c21"
  },
  "effectiveGasPrice": {
    "type": "BigNumber",
    "hex": "0x06cc0e8fd4"
  },
  "logs": [
    {
      "event": "Deposit(address,uint256)",
      "params": [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "5500000000000000"
      ]
    },
    {
      "event": "Transfer(address,address,uint256)",
      "params": [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x689d240D8C16d9fa7A678e9693c0b089458aDaAD",
        "5500000000000000"
      ]
    },
    {
      "event": "Transfer(address,address,uint256)",
      "params": [
        "0x689d240D8C16d9fa7A678e9693c0b089458aDaAD",
        "0x33cb1438E2443cDb44b18D6f2DE1491D1F77A8ee",
        "311768294792"
      ]
    },
    {
      "event": "Transfer(address,address,uint256)",
      "params": [
        "0x689d240D8C16d9fa7A678e9693c0b089458aDaAD",
        "0x156f058C67A22f96076CE8DabE14d40a90f971eE",
        "15276646444817"
      ]
    },
    {
      "event": "Sync(uint112,uint112)",
      "params": [
        "4134681071579214",
        "1459947038696920352"
      ]
    },
    {
      "event": "Swap(address,uint256,uint256,uint256,uint256,address)",
      "params": [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "122364672243051157726927388588417579627688063470",
        "0",
        "5500000000000000",
        "15588414739609",
        "0x0000000000000000000000000000000000000000"
      ]
    }
  ]
}
```

## Future plans
- [ ] Decode input contract calls data (fetch ABI from Etherscan)
- [ ] Run local server for wallets to be able to send transactions directly from dApps (maybe proxy to real net upon simulation approval?)