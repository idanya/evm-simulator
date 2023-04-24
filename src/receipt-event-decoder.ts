import { ethers } from 'ethers';

import { DecodedTransferEvent } from './decoded-transfer-event';

enum EventType {
	Transfer = 'Transfer',
}

const TOPICS = {
	'0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef': EventType.Transfer, // Transfer(address,address,uint256)
};

export class ReceiptEventDecoder {
	constructor(private readonly address: string, private readonly topics: string[], private readonly data: string) {}
	public decodeTopic(): DecodedTransferEvent {
		try {
			if (!(this.topics[0] in TOPICS)) {
				return;
			}

			const eventType = TOPICS[this.topics[0]];
			switch (eventType) {
				case EventType.Transfer:
					return this.decodeTransferEvent();
				default:
			}
		} catch (e) {
			/* empty */
		}
	}

	private decodeTransferEvent(): DecodedTransferEvent {
		const eventInterface = new ethers.Interface([
			'event Transfer(address indexed from, address indexed to, uint256 value)',
		]);

		const decodedEvent = eventInterface.decodeEventLog('Transfer', this.data, this.topics);

		const token = ethers.getAddress(this.address);
		return {
			token,
			from: decodedEvent.from,
			to: decodedEvent.to,
			value: decodedEvent.value.toString(),
		};
	}
}
