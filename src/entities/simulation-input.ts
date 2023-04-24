export interface ChainForkDefinition {
	chainNumber: number;
	rpcUrl: string;
	blockHeight?: number | 'latest';
}

export interface SimulationInput {
	from: string;
	to: string;
	chain: ChainForkDefinition;
	data: string;
	value: string;
}
