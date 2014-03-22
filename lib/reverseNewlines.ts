import IHashTable = require('interfaces/IHashTable');


var reverseNewlines: IHashTable<string> = {
	'\n': 'lf',
	'\r\n': 'crlf',
	'\r': 'cr',
	'\u000B': 'vt',
	'\u000C': 'ff',
	'\u0085': 'nel',
	'\u2028': 'ls',
	'\u2029': 'ps'
};

export = reverseNewlines;
