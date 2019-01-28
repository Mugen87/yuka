import { TriggerRegion } from './TriggerRegion.js';
import { RectangularTriggerRegion } from './regions/RectangularTriggerRegion.js';
import { SphericalTriggerRegion } from './regions/SphericalTriggerRegion.js';
import { Logger } from '../core/Logger.js';

/**
* Base class for representing triggers. A trigger generates an action if a game entity
* touches its trigger region, a predefine region in 3D space.
*
* @author {@link https://github.com/Mugen87|Mugen87}
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
		* @type Boolean
		* @default true
		*/
		this.active = true;

		/**
		* The region of the trigger.
		* @type TriggerRegion
		*/
		this.region = region;

		//

		this._typesMap = new Map(); // used for deserialization of custom triggerRegions

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
	* @param {Number} delta - The time delta value.
	* @return {Trigger} A reference to this trigger.
	*/
	update( /* delta */ ) {}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			active: this.active,
			region: this.region.toJSON()
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Trigger} A reference to this trigger.
	*/
	fromJSON( json ) {

		this.active = json.active;

		const regionJSON = json.region;
		let type = regionJSON.type;

		switch ( type ) {

			case 'TriggerRegion':
				this.region = new TriggerRegion().fromJSON( regionJSON );
				break;

			case 'RectangularTriggerRegion':
				this.region = new RectangularTriggerRegion().fromJSON( regionJSON );
				break;

			case 'SphericalTriggerRegion':
				this.region = new SphericalTriggerRegion().fromJSON( regionJSON );
				break;

			default:
				// handle custom type

				const ctor = this._typesMap.get( type );

				if ( ctor !== undefined ) {

					this.region = new ctor().fromJSON( regionJSON );

				} else {

					Logger.warn( 'YUKA.Trigger: Unsupported trigger region type:', regionJSON.type );

				}

		}

		return this;

	}

	/**
	 * Registers a custom type for deserialization. When calling {@link Trigger#fromJSON}
	 * the trigger is able to pick the correct constructor in order to create custom
	 * trigger regions.
	 *
	 * @param {String} type - The name of the trigger region.
	 * @param {Function} constructor -  The constructor function.
	 * @return {Trigger} A reference to this trigger.
	 */
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

}

export { Trigger };
