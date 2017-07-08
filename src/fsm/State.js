/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class State {

	enter () {

		console.warn( 'YUKA.State: .enter() must be implemented in derived class.' );

	}

	execute () {

		console.warn( 'YUKA.State: .execute() must be implemented in derived class.' );

	}

	exit () {

		console.warn( 'YUKA.State: .exit() must be implemented in derived class.' );

	}

}

export { State };
