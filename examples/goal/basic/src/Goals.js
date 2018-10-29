/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Goal, CompositeGoal, Matrix4, Vector3 } from '../../../../../build/yuka.module.js';
import world from './World.js';

const REST = 'REST';
const GATHER = 'GATHER';
const FIND_NEXT = 'FIND NEXT';
const SEEK = 'SEEK';
const PICK_UP = 'PICK UP';
const PLACEHOLDER = '-';

const WALK = 'WALK';
const RIGHT_TURN = 'RIGHT_TURN';
const LEFT_TURN = 'LEFT_TURN';
const IDLE = 'IDLE';

const inverseMatrix = new Matrix4();
const localPosition = new Vector3();

class RestGoal extends Goal {

	constructor( owner ) {

		super( owner );

	}

	activate() {

		const owner = this.owner;

		owner.ui.currentGoal.textContent = REST;
		owner.ui.currentSubgoal.textContent = PLACEHOLDER;

		//

		const gather = owner.animations.get( GATHER );
		const idle = owner.animations.get( IDLE );

		idle.time = 0;
		idle.enabled = true;
		gather.crossFadeTo( idle, owner.crossFadeDuration );

	}

	execute() {

		const owner = this.owner;

		if ( owner.currentTime <= owner.pickUpDuration ) {

			owner.currentTime += owner.deltaTime;

		} else {

			owner.currentTime = 0;
			owner.currentTarget = null;

			this.status = Goal.STATUS.COMPLETED;

		}

	}

	terminate() {

		this.owner.fatigueLevel = 0;

	}

}

//

class GatherGoal extends CompositeGoal {

	constructor( owner ) {

		super( owner );

	}

	activate() {

		const owner = this.owner;

		owner.ui.currentGoal.textContent = GATHER;

		this.addSubgoal( new FindNextCollectible( owner ) );
		this.addSubgoal( new SeekToCollectible( owner ) );
		this.addSubgoal( new PickUpCollectible( owner ) );

		// TODO This line fixes the problem of a frame where no animation is active

		owner.animations.get( IDLE ).enabled = false;
		owner.animations.get( GATHER ).enabled = false;

	}

	execute() {

		this.activateIfInactive();

		this.status = this.executeSubgoals();

	}

	terminate() {

		this.clearSubgoals();

	}

}

//

class FindNextCollectible extends Goal {

	constructor( owner ) {

		super( owner );

		this.animationId = null;

	}

	activate() {

		const owner = this.owner;

		// update UI

		owner.ui.currentSubgoal.textContent = FIND_NEXT;

		// select closest collectible

		const collectibles = world.collectibles;
		let minDistance = Infinity;

		for ( let i = 0, l = collectibles.length; i < l; i ++ ) {

			const collectible = collectibles[ i ];

			const squaredDistance = owner.position.squaredDistanceTo( collectible.position );

			if ( squaredDistance < minDistance ) {

				minDistance = squaredDistance;
				owner.currentTarget = collectible;

			}

		}

		// determine if the girl should perform a left or right turn in order to face
		// the collectible

		owner.updateMatrix();
		owner.matrix.getInverse( inverseMatrix );
		localPosition.copy( owner.currentTarget.position ).applyMatrix4( inverseMatrix );

		this.animationId = ( localPosition.x >= 0 ) ? LEFT_TURN : RIGHT_TURN;

		const animation = owner.animations.get( this.animationId );
		animation.enabled = true;
		animation.time = 0;

	}

	execute() {

		const owner = this.owner;

		if ( owner.currentTarget !== null ) {

			if ( owner.rotateTo( owner.currentTarget.position, owner.deltaTime ) === true ) {

				this.status = Goal.STATUS.COMPLETED;

			}

		} else {

			this.status = Goal.STATUS.FAILED;

		}

	}

	terminate() {

		const owner = this.owner;

		const turn = owner.animations.get( this.animationId );
		const walk = owner.animations.get( WALK );

		walk.enabled = true;
		walk.time = 0;
		turn.crossFadeTo( walk, owner.crossFadeDuration );

	}

}

//

class SeekToCollectible extends Goal {

	constructor( owner ) {

		super( owner );

	}

	activate() {

		const owner = this.owner;

		// update UI

		owner.ui.currentSubgoal.textContent = SEEK;

		//

		if ( owner.currentTarget !== null ) {

			const arriveBehavior = owner.steering.behaviors[ 0 ];
			arriveBehavior.target = owner.currentTarget.position;
			arriveBehavior.active = true;

		} else {

			this.status = Goal.STATUS.FAILED;

		}

	}

	execute() {

		const owner = this.owner;

		const squaredDistance = owner.position.squaredDistanceTo( owner.currentTarget.position );

		if ( squaredDistance < 0.25 ) {

			this.status = Goal.STATUS.COMPLETED;

		}

		// adjust animation speed based on the actual velocity of the girl

		const animation = owner.animations.get( WALK );
		animation.timeScale = Math.min( 0.75, owner.getSpeed() / owner.maxSpeed );

	}

	terminate() {

		const arriveBehavior = this.owner.steering.behaviors[ 0 ];
		arriveBehavior.active = false;
		this.owner.velocity.set( 0, 0, 0 );

		//

		const owner = this.owner;

		const walk = owner.animations.get( WALK );
		const gather = owner.animations.get( GATHER );

		gather.enabled = true;
		gather.time = 0;
		walk.crossFadeTo( gather, owner.crossFadeDuration );

	}

}

//

class PickUpCollectible extends Goal {

	constructor( owner ) {

		super( owner );

	}

	activate() {

		this.owner.ui.currentSubgoal.textContent = PICK_UP;

	}

	execute() {

		const owner = this.owner;

		if ( owner.currentTime <= owner.pickUpDuration ) {

			owner.currentTime += owner.deltaTime;

		} else {

			this.status = Goal.STATUS.COMPLETED;

		}

	}

	terminate() {

		const owner = this.owner;

		world.removeCollectible( owner.currentTarget );

		owner.currentTime = 0;
		owner.currentTarget = null;
		owner.fatigueLevel ++;

	}

}

export {
	RestGoal,
	GatherGoal
};
