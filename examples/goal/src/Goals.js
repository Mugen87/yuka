/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Goal, CompositeGoal, Matrix4, Vector3 } from '../../../build/yuka.module.js';

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

		const idle = owner.animations.get( IDLE );
		idle.reset().fadeIn( owner.crossFadeDuration );

	}

	execute() {

		const owner = this.owner;

		owner.currentTime += owner.deltaTime;

		if ( owner.currentTime >= owner.restDuration ) {

			this.status = Goal.STATUS.COMPLETED;

		}

	}

	terminate() {

		const owner = this.owner;

		owner.currentTime = 0;
		owner.fatigueLevel = 0;

	}

}

//

class GatherGoal extends CompositeGoal {

	constructor( owner ) {

		super( owner );

	}

	activate() {

		this.clearSubgoals();

		const owner = this.owner;

		owner.ui.currentGoal.textContent = GATHER;

		this.addSubgoal( new FindNextCollectibleGoal( owner ) );
		this.addSubgoal( new SeekToCollectibleGoal( owner ) );
		this.addSubgoal( new PickUpCollectibleGoal( owner ) );

		const idle = owner.animations.get( IDLE );
		idle.fadeOut( owner.crossFadeDuration );

	}

	execute() {

		this.status = this.executeSubgoals();

		this.replanIfFailed();

	}

}

//

class FindNextCollectibleGoal extends Goal {

	constructor( owner ) {

		super( owner );

		this.animationId = null;

	}

	activate() {

		const owner = this.owner;

		// update UI

		owner.ui.currentSubgoal.textContent = FIND_NEXT;

		// select closest collectible

		const entities = owner.manager.entities;
		let minDistance = Infinity;

		for ( let i = 0, l = entities.length; i < l; i ++ ) {

			const entity = entities[ i ];

			if ( entity !== owner ) {

				const squaredDistance = owner.position.squaredDistanceTo( entity.position );

				if ( squaredDistance < minDistance ) {

					minDistance = squaredDistance;
					owner.currentTarget = entity;

				}

			}

		}

		// determine if the girl should perform a left or right turn in order to face
		// the collectible

		owner.worldMatrix.getInverse( inverseMatrix );
		localPosition.copy( owner.currentTarget.position ).applyMatrix4( inverseMatrix );

		this.animationId = ( localPosition.x >= 0 ) ? LEFT_TURN : RIGHT_TURN;

		const turn = owner.animations.get( this.animationId );
		turn.reset().fadeIn( owner.crossFadeDuration );

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
		turn.fadeOut( owner.crossFadeDuration );

	}

}

//

class SeekToCollectibleGoal extends Goal {

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

		//

		const walk = owner.animations.get( WALK );
		walk.reset().fadeIn( owner.crossFadeDuration );

	}

	execute() {

		if ( this.active() ) {

			const owner = this.owner;

			const squaredDistance = owner.position.squaredDistanceTo( owner.currentTarget.position );

			if ( squaredDistance < 0.25 ) {

				this.status = Goal.STATUS.COMPLETED;

			}

			// adjust animation speed based on the actual velocity of the girl

			const animation = owner.animations.get( WALK );
			animation.timeScale = Math.min( 0.75, owner.getSpeed() / owner.maxSpeed );

		}

	}

	terminate() {

		const arriveBehavior = this.owner.steering.behaviors[ 0 ];
		arriveBehavior.active = false;
		this.owner.velocity.set( 0, 0, 0 );

		//

		const owner = this.owner;

		const walk = owner.animations.get( WALK );
		walk.fadeOut( owner.crossFadeDuration );

	}

}

//

class PickUpCollectibleGoal extends Goal {

	constructor( owner ) {

		super( owner );

		this.collectibleRemoveTimeout = 3; // the time in seconds after a collectible is removed

	}

	activate() {

		const owner = this.owner;

		owner.ui.currentSubgoal.textContent = PICK_UP;

		const gather = owner.animations.get( GATHER );
		gather.reset().fadeIn( owner.crossFadeDuration );

	}

	execute() {

		const owner = this.owner;
		owner.currentTime += owner.deltaTime;

		if ( owner.currentTime >= owner.pickUpDuration ) {

			this.status = Goal.STATUS.COMPLETED;

		} else if ( owner.currentTime >= this.collectibleRemoveTimeout ) {

			if ( owner.currentTarget !== null ) {

				owner.sendMessage( owner.currentTarget, 'PickedUp' );
				owner.currentTarget = null;

			}

		}

	}

	terminate() {

		const owner = this.owner;

		owner.currentTime = 0;
		owner.fatigueLevel ++;

		const gather = owner.animations.get( GATHER );
		gather.fadeOut( owner.crossFadeDuration );

	}

}

export {
	RestGoal,
	GatherGoal
};
