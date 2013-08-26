///<reference path='../../vendor/dt-node/node.d.ts'/>
import eclint = require('../eclint');
import _line = require('../line');


export enum IndentSizes { tab = -1, 0, 1, 2, 3, 4, 5, 6, 7, 8 };

export function check(context: eclint.Context, setting: eclint.Settings,
	data: string): void {

	// context.report(msg)
}

export function fix(settings: eclint.Settings, data: string): string {
	return data;
}

export function infer(data): IndentSizes {
	return IndentSizes.tab;
	// return setting (e.g., true, false)
}
