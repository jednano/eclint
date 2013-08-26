///<reference path='../../vendor/dt-node/node.d.ts'/>
import eclint = require('../eclint');
import _line = require('../line');


export function check(context: eclint.Context, settings: eclint.Settings,
	data: string): void {

	// context.report(msg)
}

export function fix(settings: eclint.Settings, data: string): string {
	return data;
}

export function infer(data: string): boolean {
	return true;
	// return setting (e.g., true, false)
}
