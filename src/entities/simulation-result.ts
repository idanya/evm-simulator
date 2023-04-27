import { TransferEvent } from './transfer-event';
import { BigNumber } from '@ethersproject/bignumber';

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
