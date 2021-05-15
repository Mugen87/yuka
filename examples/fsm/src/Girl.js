/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, StateMachine } from '../../../build/yuka.module.js';

import { IdleState, WalkState } from './States.js';

class Girl extends GameEntity {

	constructor( mixer, animations ) {

		super();

		this.mixer = mixer;
		this.animations = animations;

		this.ui = {
			currentState: document.getElementById( 'currentState' )
		};

		//

		this.stateMachine = new StateMachine( this );

		this.stateMachine.add( 'IDLE', new IdleState() );
		this.stateMachine.add( 'WALK', new WalkState() );

		this.stateMachine.changeTo( 'IDLE' );

		//

		this.currentTime = 0; // tracks how long the entity is in the current state
		this.stateDuration = 5; // duration of a single state in seconds
		this.crossFadeDuration = 1; // duration of a crossfade in seconds

	}

	update( delta ) {

		this.currentTime += delta;

		this.stateMachine.update();

		this.mixer.update( delta );

		return this;

	}

}

export { Girl };
