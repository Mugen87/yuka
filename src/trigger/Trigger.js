import { TriggerRegion } from './TriggerRegion.js';
import { RectangularTriggerRegion } from './regions/RectangularTriggerRegion.js';
import { SphericalTriggerRegion } from './regions/SphericalTriggerRegion.js';
import { GameEntity } from '../core/GameEntity.js';
import { Logger } from '../core/Logger.js';

/**
* Base class for representing triggers. A trigger generates an action if a game entity
* touches its trigger region, a predefine area in 3D space.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments GameEntity
*/
class Trigger extends GameEntity {

	/**
	* Constructs a new trigger with the given values.
	*
	* @param {TriggerRegion} region - The region of the trigger.
	*/
	constructor( region = new TriggerRegion() ) {

		super();

		/**
		* The region of the trigger.
		* @type {TriggerRegion}
		*/
		this.region = region;

		//

		this.canActivateTrigger = false; // triggers can't activate other triggers by default

		this._typesMap = new Map(); // used for deserialization of custom trigger regions

	}

	/**
	* This method is called per simulation step for all game entities. If the game
	* entity touches the region of the trigger, the respective action is executed.
	*
	* @param {GameEntity} entity - The entity to test
	* @return {Trigger} A reference to this trigger.
	*/
	check( entity ) {

		if ( this.region.touching( entity ) === true ) {

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
	* Updates the region of this trigger. Called by the {@link EntityManager} per
	* simulation step.
	*
	* @return {Trigger} A reference to this trigger.
	*/
	updateRegion() {

		this.region.update( this );

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.region = this.region.toJSON();

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Trigger} A reference to this trigger.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

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
	 * @param {Function} constructor - The constructor function.
	 * @return {Trigger} A reference to this trigger.
	 */
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

}

export { Trigger };
