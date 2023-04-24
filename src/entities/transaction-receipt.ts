import { BigNumber } from '@ethersproject/bignumber';
import { DecodedTransferEvent } from '../decoded-transfer-event';

export class TransactionReceipt {
	to: string;
	from: string;
	contractAddress: string;
	logs: DecodedTransferEvent[];
	gasUsed: BigNumber;
	cumulativeGasUsed: BigNumber;
	effectiveGasPrice: BigNumber;
}
