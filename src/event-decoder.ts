import { concat, ethers } from 'ethers';

import axios from 'axios';
import { OpenChainResponse } from './entities/openchain';

export class EventDecoder {
	constructor(private readonly topics: string[], private readonly data: string) {}

	public async decode(): Promise<object> {
		try {
			const eventSignature = await this.fetchTopic(this.topics[0]);
			const decoded = this.decodeEvent(eventSignature);

			return {
				event: eventSignature,
				params: decoded.toArray().map(v => v.toString()),
			};
		} catch (e) {
			console.error(e);
		}
	}

	private async fetchTopic(event: string): Promise<string | undefined> {
		try {
			const response = await axios.get<OpenChainResponse>(
				`https://api.openchain.xyz/signature-database/v1/lookup?filter=false&event=${event}`,
			);
			if (!response.data.ok || !response.data.result.event) {
				return;
			}

			const matches = response.data.result.event[event];
			if (matches.length > 0) {
				return matches[0].name;
			}
		} catch (e) {
			return undefined;
		}
	}

	private decodeEvent(eventSignature: string) {
		const eventInterface = new ethers.Interface([`event ${eventSignature}`]);

		const funcName = eventSignature.substring(0, eventSignature.indexOf('('));
		const completeData = concat([...this.topics.splice(1), this.data]);

		const inputParams = eventInterface.getEvent(funcName).inputs.map(input => input.type);
		return ethers.AbiCoder.defaultAbiCoder().decode(inputParams, completeData);
	}
}
