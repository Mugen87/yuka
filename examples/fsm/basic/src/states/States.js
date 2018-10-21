/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { State } from '../../../../../build/yuka.module.js';

const IDLE = 'IDLE';
const WALK = 'WALK';

class IdleState extends State {

	enter( girl ) {

		const animation = girl.animations.get( IDLE );

		if ( animation.isRunning() === false ) {

			animation.play();
			animation.enabled = true;

		}

		//

		girl.ui.currentState.textContent = IDLE;

	}

	execute( girl ) {

		if ( girl.currentTime >= girl.stateDuration ) {

			girl.currentTime = 0;
			girl.stateMachine.changeTo( WALK );

		}

	}

	exit( girl ) {

		const idle = girl.animations.get( IDLE );
		const walk = girl.animations.get( WALK );

		idle.crossFadeTo( walk, girl.crossFadeDuration );

	}

}

class WalkState extends State {

	enter( girl ) {

		const animation = girl.animations.get( WALK );

		if ( animation.isRunning() === false ) {

			animation.play();
			animation.enabled = true;

		}

		//

		girl.ui.currentState.textContent = WALK;

	}

	execute( girl ) {

		if ( girl.currentTime >= girl.stateDuration ) {

			girl.currentTime = 0;
			girl.stateMachine.changeTo( IDLE );

		}


	}

	exit( girl ) {

		const walk = girl.animations.get( WALK );
		const idle = girl.animations.get( IDLE );

		walk.crossFadeTo( idle, girl.crossFadeDuration );

	}

}

export {
	IdleState,
	WalkState
};
