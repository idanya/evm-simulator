import { ethers, parseEther } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { SimulationResult } from './entities/simulation-result';
import { TransferEvent } from './entities/transfer-event';
import { SimulationInput } from './entities/simulation-input';
import { EventDecoder } from './event-decoder';
import { Log } from '@ethersproject/abstract-provider/src.ts';
import { LocalEVMProvider } from './evm/local-evm-provider';

export class Simulator {
	constructor(private readonly evmProvider: LocalEVMProvider) {}

	public async simulate(input: SimulationInput): Promise<SimulationResult> {
		const signer = await this.evmProvider.getAccountSigner(input.from);

		const txToSend = {
			from: input.from,
			to: input.to,
			value: parseEther(input.value),
			data: input.data,
		};

		const txResult = await signer.sendTransaction(txToSend);
		return this.processTransactionResponse(txResult);
	}

	private async processTransactionResponse(txResponse: TransactionResponse): Promise<SimulationResult> {
		const baseAssetTransfer: TransferEvent = {
			from: ethers.getAddress(txResponse.from),
			to: ethers.getAddress(txResponse.to),
			value: BigNumber.from(txResponse.value).toString(),
		};

		const internalTransfers = await this.evmProvider.extractInternalTransfers(txResponse.hash, txResponse.to);
		const receipt = await this.evmProvider.getTransactionReceipt(txResponse.hash);

		return {
			internalTransfers,
			baseAssetTransfer,
			from: receipt.from,
			to: receipt.to,
			gasUsed: receipt.gasUsed,
			cumulativeGasUsed: receipt.cumulativeGasUsed,
			effectiveGasPrice: receipt.effectiveGasPrice,
			logs: receipt.logs.length > 0 ? await this.decodeLogs(receipt.logs) : [],
		};
	}

	private async decodeLogs(logs: Log[]): Promise<object[]> {
		const decoded: object[] = [];
		for (const log of logs) {
			const eventDecoder = new EventDecoder(log.topics, log.data);
			const decodedLog = await eventDecoder.decode();
			if (decodedLog) {
				decoded.push(decodedLog);
			}
		}

		return decoded;
	}
}
