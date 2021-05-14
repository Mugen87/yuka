/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vehicle, Think, ArriveBehavior } from '../../../build/yuka.module.js';
import { RestEvaluator, GatherEvaluator } from './Evaluators.js';

class Girl extends Vehicle {

	constructor( mixer, animations ) {

		super();

		this.maxTurnRate = Math.PI * 0.5;
		this.maxSpeed = 1.5;

		this.mixer = mixer;
		this.animations = animations;

		const idle = this.animations.get( 'IDLE' );
		idle.enabled = true;

		this.ui = {
			currentGoal: document.getElementById( 'currentGoal' ),
			currentSubgoal: document.getElementById( 'currentSubgoal' )
		};

		// goal-driven agent design

		this.brain = new Think( this );

		this.brain.addEvaluator( new RestEvaluator() );
		this.brain.addEvaluator( new GatherEvaluator() );

		// steering

		const arriveBehavior = new ArriveBehavior();
		arriveBehavior.deceleration = 1.5;
		this.steering.add( arriveBehavior );

		//

		this.fatigueLevel = 0; // current level of fatigue
		this.restDuration = 5; //  duration of a rest phase in seconds
		this.pickUpDuration = 6; //  duration of a pick phase in seconds
		this.crossFadeDuration = 0.5; // duration of a crossfade in seconds
		this.currentTarget = null; // current collectible

		this.currentTime = 0; // tracks the current time of an action
		this.deltaTime = 0; // the current time delta value

		this.MAX_FATIGUE = 3; // the girl needs to rest if this amount of fatigue is reached

	}

	update( delta ) {

		super.update( delta );

		this.deltaTime = delta;

		this.brain.execute();

		this.brain.arbitrate();

		this.mixer.update( delta );

		return this;

	}

	tired() {

		return ( this.fatigueLevel >= this.MAX_FATIGUE );

	}

}

export { Girl };
