interface ILogger {
	info(message: string);
	debug(message: string);
	warn(message: string);
	error(err: Error);
}

export = ILogger;
