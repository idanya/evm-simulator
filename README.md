# EVM Simulator

## Abstract
EVM Simulator is a tools to simulate EVM blockchain transaction without really sending them to the network. 
This is done by running a local "soft" fork or any EVM chain and sending the transaction locally in order to process its logs and the opcodes that were executed.

A simulated transaction can be done from any to any address without needing the source EOA keys.

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