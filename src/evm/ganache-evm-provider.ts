import { ChainForkDefinition } from '../entities/simulation-input';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { provider } from 'ganache';
import { TransferEvent } from '../entities/transfer-event';
import { BigNumber } from '@ethersproject/bignumber';
import { StructLog } from '../entities/struct-log';
import { LocalEVMProvider } from './local-evm-provider';

export class GanacheEVMProvider implements LocalEVMProvider {
	private provider: Web3Provider;

	constructor(private readonly chainForkDefinition: ChainForkDefinition) {}

	async getAccountSigner(address: string): Promise<JsonRpcSigner> {
		await this.getProvider().send('evm_addAccount', [address, 'password']);
		await this.getProvider().send('personal_unlockAccount', [address, 'password']);
		return this.getProvider().getSigner(address);
	}

	async extractInternalTransfers(txHash: string, toAddress: string): Promise<TransferEvent[]> {
		const txTrace = await this.getProvider().send('debug_traceTransaction', [txHash, {}]);
		return this.processTraceForInternalTransfers(txTrace.structLogs, toAddress);
	}

	async getTransactionReceipt(tsHash: string) {
		return this.getProvider().getTransactionReceipt(tsHash);
	}

	private getProvider(): Web3Provider {
		if (this.provider) {
			return this.provider;
		}

		const ganacheProvider = provider({
			chain: {
				chainId: this.chainForkDefinition.chainNumber,
			},

			fork: {
				url: this.chainForkDefinition.rpcUrl,
				blockNumber: this.chainForkDefinition.blockHeight,
			},
		});

		this.provider = new Web3Provider(ganacheProvider);
		return this.provider;
	}

	private processTraceForInternalTransfers(structLogs: StructLog[], initialFrom: string): TransferEvent[] {
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
