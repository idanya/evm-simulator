interface OpenChainEntry {
	name: string;
	filter: boolean;
}

interface OpenChainResult {
	event?: Record<string, Array<OpenChainEntry>>;
	function?: Record<string, Array<OpenChainEntry>>;
}

export interface OpenChainResponse {
	ok: boolean;
	result: OpenChainResult;
}
