/**
 * @author Mugen87 / https://github.com/Mugen87
 */

/* istanbul ignore next */

class Logger {

	static setLevel( level ) {

		currentLevel = level;

	}

	static log( ...args ) {

		if ( currentLevel <= Logger.LEVEL.LOG ) console.log( ...args );

	}

	static warn( ...args ) {

		if ( currentLevel <= Logger.LEVEL.WARN ) console.warn( ...args );

	}

	static error( ...args ) {

		if ( currentLevel <= Logger.LEVEL.ERROR ) console.error( ...args );

	}

}

Logger.LEVEL = Object.freeze( {
	LOG: 0,
	WARN: 1,
	ERROR: 2,
	SILENT: 3
} );

let currentLevel = Logger.LEVEL.WARN;


export { Logger };
