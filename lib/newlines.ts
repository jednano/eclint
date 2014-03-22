import IHashTable = require('interfaces/IHashTable');


var newlines: IHashTable<string> = {
	lf: '\n',
	crlf: '\r\n',
	cr: '\r',
	vt: '\u000B',
	ff: '\u000C',
	nel: '\u0085',
	ls: '\u2028',
	ps: '\u2029'
};

export = newlines;
