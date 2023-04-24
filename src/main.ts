import { Command } from 'commander';
import { SimulationInput } from './entities/simulation-input';
import { Simulator } from './simulator';

const program = new Command();

program
	.version('1.0.0')
	.description('EVM Simulator')
	.option('-c, --chain  [value]', 'Chain id', '1')
	.option('-b, --blockheight  [value]', 'Block height to fork from')
	.option('--rpc  [value]', 'Chain rpc', 'https://ethereum.publicnode.com')
	.option('--from  [value]', 'Source EOA')
	.option('--to  [value]', 'Transaction target')
	.option('--value  [value]', 'Sent ETH value (in ETH)')
	.option('--data  [value]', 'Contract call data (hex string)')
	.parse(process.argv);

const options = program.opts();

const input: SimulationInput = {
	from: options.from,
	to: options.to,
	chain: {
		chainNumber: parseInt(options.chain),
		rpcUrl: options.rpc,
		blockHeight: options.blockHeight ? parseInt(options.blockheight) : 'latest',
	},
	data: options.data,
	value: options.value,
};

const simulator = new Simulator();
simulator
	.simulate(input)
	.then(result => {
		console.log(JSON.stringify(result, undefined, 2));
	})
	.catch(error => {
		console.log(error);
	});