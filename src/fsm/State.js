/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class State {

	enter () {}

	execute () {

		console.warn( 'YUKA.State: .execute() must be implemented in derived class.' );

	}

	exit () {}

	onMessage () { return false; }

}

export { State };
