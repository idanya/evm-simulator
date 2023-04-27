import { JsonRpcSigner, TransactionReceipt } from '@ethersproject/providers';
import { TransferEvent } from '../entities/transfer-event';

export interface LocalEVMProvider {
	getAccountSigner(address: string): Promise<JsonRpcSigner>;
	extractInternalTransfers(txHash: string, toAddress: string): Promise<TransferEvent[]>;
	getTransactionReceipt(tsHash: string): Promise<TransactionReceipt>;
}
