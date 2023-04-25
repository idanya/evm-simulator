import { ethers, parseEther } from 'ethers';

import { provider } from 'ganache';
import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcSigner, TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { SimulationResult } from './entities/simulation-result';
import { TransferEvent } from './entities/transfer-event';
import { ChainForkDefinition, SimulationInput } from './entities/simulation-input';
import { DecodedTransferEvent } from './decoded-transfer-event';
import { ReceiptEventDecoder } from './receipt-event-decoder';
import { Log } from '@ethersproject/abstract-provider/src.ts';

interface StructLog {
	op: string;
	depth: number;
	stack: string[];
}

export class Simulator {
	public async simulate(input: SimulationInput): Promise<SimulationResult> {
		const provider = this.getProvider(input.chain);
		const signer = await this.getAccountSigner(provider, input.from);

		const txToSend = {
			from: input.from,
			to: input.to,
			value: parseEther(input.value),
			data: input.data,
		};

		const txResult = await signer.sendTransaction(txToSend);

		return this.processTransactionResponse(provider, txResult);
	}

	private async processTransactionResponse(
		provider: Web3Provider,
		txResponse: TransactionResponse,
	): Promise<SimulationResult> {
		const baseAssetTransfer: TransferEvent = {
			from: ethers.getAddress(txResponse.from),
			to: ethers.getAddress(txResponse.to),
			value: BigNumber.from(txResponse.value).toString(),
		};

		const internalTransfers = await this.traceTransaction(provider, txResponse.hash, txResponse.to);
		const receipt = await provider.getTransactionReceipt(txResponse.hash);

		return {
			internalTransfers,
			baseAssetTransfer,
			receipt: {
				from: receipt.from,
				to: receipt.to,
				contractAddress: receipt.contractAddress,
				logs: await this.decodeLogs(receipt.logs),
				gasUsed: receipt.gasUsed,
				cumulativeGasUsed: receipt.cumulativeGasUsed,
				effectiveGasPrice: receipt.effectiveGasPrice,
			},
		};
	}

	private async decodeLogs(logs: Log[]): Promise<DecodedTransferEvent[]> {
		const decoded: DecodedTransferEvent[] = [];
		for (const log of logs) {
			const topicDecoder = new ReceiptEventDecoder(log.address, log.topics, log.data);
			const decodedLog = topicDecoder.decodeTopic();
			if (decodedLog) {
				decoded.push(decodedLog);
			}
		}

		return decoded;
	}

	private async traceTransaction(
		provider: Web3Provider,
		txHash: string,
		toAddress: string,
	): Promise<TransferEvent[]> {
		const txTrace = await provider.send('debug_traceTransaction', [txHash, {}]);
		return this.getInternalTransfers(txTrace.structLogs, toAddress);
	}

	private getProvider(chainForkDefinition: ChainForkDefinition): Web3Provider {
		const ganacheProvider = provider({
			chain: {
				chainId: chainForkDefinition.chainNumber,
			},
			fork: {
				url: chainForkDefinition.rpcUrl,
				blockNumber: chainForkDefinition.blockHeight,
			},
		});

		return new Web3Provider(ganacheProvider);
	}

	private async getAccountSigner(provider: Web3Provider, address: string): Promise<JsonRpcSigner> {
		await provider.send('evm_addAccount', [address, 'password']);
		await provider.send('personal_unlockAccount', [address, 'password']);
		return provider.getSigner(address);
	}

	private getInternalTransfers(structLogs: StructLog[], initialFrom: string): TransferEvent[] {
		const sourceInDepth = {
			1: initialFrom,
		};

		const result: TransferEvent[] = [];
		for (let i = 0; i < structLogs.length; i++) {
			const log = structLogs[i];
			if (log.op === 'DELEGATECALL') {
				// keep the same source
				sourceInDepth[log.depth + 1] = sourceInDepth[log.depth];
			} else if (log.op === 'CALL') {
				const to = log.stack[log.stack.length - 2];
				const value = log.stack[log.stack.length - 3];
				const from = sourceInDepth[log.depth];

				const numValue = BigNumber.from(`0x${value}`);
				if (!numValue.isZero()) {
					result.push({ from, to, value: numValue.toString() });
				}

				sourceInDepth[log.depth + 1] = to;
			}
		}

		return result;
	}
}
