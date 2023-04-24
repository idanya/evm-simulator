import { TransactionReceipt } from './transaction-receipt';
import { TransferEvent } from './transfer-event';

export class SimulationResult {
	receipt: TransactionReceipt;
	baseAssetTransfer?: TransferEvent;
	internalTransfers?: TransferEvent[];
}
