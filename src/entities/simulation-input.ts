export interface ChainForkDefinition {
	chainNumber: number;
	rpcUrl: string;
	blockHeight?: number | 'latest';
}

export interface SimulationInput {
	from: string;
	to: string;
	data: string;
	value: string;
}
