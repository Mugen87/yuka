/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { State } from '../../../build/yuka.module.js';

const IDLE = 'IDLE';
const WALK = 'WALK';

class IdleState extends State {

	enter( girl ) {

		const idle = girl.animations.get( IDLE );
		idle.reset().fadeIn( girl.crossFadeDuration );

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
		idle.fadeOut( girl.crossFadeDuration );

	}

}

class WalkState extends State {

	enter( girl ) {

		girl.ui.currentState.textContent = WALK;

		const walk = girl.animations.get( WALK );
		walk.reset().fadeIn( girl.crossFadeDuration );

	}

	execute( girl ) {

		if ( girl.currentTime >= girl.stateDuration ) {

			girl.currentTime = 0;
			girl.stateMachine.changeTo( IDLE );

		}

	}

	exit( girl ) {

		const walk = girl.animations.get( WALK );
		walk.fadeOut( girl.crossFadeDuration );

	}

}

export {
	IdleState,
	WalkState
};
