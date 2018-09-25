import { TriggerRegion } from './TriggerRegion.js';

/**
* Base class for represeting triggers. A trigger generates an action if a game entity
* touches its trigger region, a predefine region in 3D space.
*
* @author {@link https://github.com/Mugen87|Mugen87 }
*/
class Trigger {

	/**
	* Constructs a new trigger with the given values.
	*
	* @param {TriggerRegion} region - The region of the trigger.
	*/
	constructor( region = new TriggerRegion() ) {

		/**
		* Whether this trigger is active or not.
		* @type boolean
		* @default true
		*/
		this.active = true;

		/**
		* The region of the trigger.
		* @type TriggerRegion
		*/
		this.region = region;

	}

	/**
	* This method is called per simulation step for all game entities. If the game
	* entity touches the region of the trigger, the respective action is executed.
	*
	* @param {GameEntity} entity - The entity to test
	* @return {Trigger} A reference to this trigger.
	*/
	check( entity ) {

		if ( ( this.active === true ) && ( this.region.touching( entity ) === true ) ) {

			this.execute( entity );

		}

		return this;

	}

	/**
	* This method is called when the trigger should execute its action.
	* Must be implemented by all concrete triggers.
	*
	* @param {GameEntity} entity - The entity that touched the trigger region.
	* @return {Trigger} A reference to this trigger.
	*/
	execute( /* entity */ ) {}

	/**
	* Triggers can have internal states. This method is called per simulation step
	* and can be used to update the trigger.
	*
	* @param {number} delta - The time delta value.
	* @return {Trigger} A reference to this trigger.
	*/
	update( /* delta */ ) {}

}

export { Trigger };
