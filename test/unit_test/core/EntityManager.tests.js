/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const CoreJSONs = require( '../../files/CoreJSONs.js' );

const EntityManager = YUKA.EntityManager;
const CellSpacePartitioning = YUKA.CellSpacePartitioning;
const GameEntity = YUKA.GameEntity;
const MessageDispatcher = YUKA.MessageDispatcher;
const Telegram = YUKA.Telegram;
const Trigger = YUKA.Trigger;
const MovingEntity = YUKA.MovingEntity;
const Vehicle = YUKA.Vehicle;
const TriggerRegion = YUKA.TriggerRegion;

describe( 'EntityManager', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const manager = new EntityManager();

			expect( manager ).to.have.a.property( 'entities' ).that.is.an( 'array' );
			expect( manager ).to.have.a.property( 'spatialIndex' ).that.is.null;
			expect( manager ).to.have.a.property( '_triggers' ).that.is.an( 'array' );
			expect( manager ).to.have.a.property( '_indexMap' ).that.is.a( 'map' );
			expect( manager ).to.have.a.property( '_typesMap' ).that.is.a( 'map' );
			expect( manager ).to.have.a.property( '_messageDispatcher' ).that.is.an.instanceof( MessageDispatcher );

		} );

	} );

	describe( '#add()', function () {

		it( 'should add a game entity to the entity manager', function () {

			const manager = new EntityManager();
			const entity = new GameEntity();

			manager.add( entity );

			expect( manager.entities ).to.include( entity );

		} );

		it( 'should set the manager property of a game entity when added to the manager', function () {

			const manager = new EntityManager();
			const entity = new GameEntity();

			manager.add( entity );
			expect( entity.manager ).to.equal( manager );

		} );

	} );

	describe( '#remove()', function () {

		it( 'should remove a game entity from the entity manager', function () {

			const manager = new EntityManager();
			const entity = new GameEntity();

			manager.add( entity );
			manager.remove( entity );

			expect( manager.entities ).to.not.include( entity );

		} );

		it( 'should set the manager property of a game entity to null when removed from the manager', function () {

			const manager = new EntityManager();
			const entity = new GameEntity();

			manager.add( entity );
			manager.remove( entity );
			expect( entity.manager ).to.be.null;

		} );

	} );

	describe( '#clear()', function () {

		it( 'should clear all internal data structures', function () {

			const manager = new EntityManager();
			const entity = new GameEntity();
			const telegram = new Telegram();

			manager.entities.push( entity );
			manager._messageDispatcher.delayedTelegrams.push( telegram );

			manager.clear();

			expect( manager.entities ).to.have.lengthOf( 0 );
			expect( manager._messageDispatcher.delayedTelegrams ).to.have.lengthOf( 0 );

		} );

	} );

	describe( '#getEntityByName()', function () {

		it( 'should return an entity with the given name', function () {

			const manager = new EntityManager();
			const entity = new GameEntity();
			entity.name = 'name';

			manager.add( entity );

			expect( manager.getEntityByName( entity.name ) ).to.equal( entity );

		} );

		it( 'should return null if there is no game entity stored for the given name', function () {

			const manager = new EntityManager();
			const entity = new GameEntity();
			entity.name = 'name';

			manager.add( entity );

			expect( manager.getEntityByName( '' ) ).to.be.null;

		} );

	} );

	describe( '#update()', function () {

		it( 'should call the update method of game entities', function () {

			const manager = new EntityManager();
			const delta = 1;

			const entity = new CustomEntity();
			manager.add( entity );

			manager.update( delta );

			expect( entity.updated ).to.be.true;

		} );

		it( 'should call the start method of game entities only once', function () {

			const manager = new EntityManager();

			const entity = new CustomEntity();
			manager.add( entity );

			manager.update();
			manager.update();
			manager.update();
			expect( entity.startCounter ).to.equal( 1 );

		} );

		it( 'should process a trigger (update region and test with other entities)', function () {

			const manager = new EntityManager();
			const delta = 1;

			const trigger = new CustomTrigger();

			manager.add( trigger );

			manager.update( delta );

			expect( trigger.regionUpdated ).to.be.true;

		} );

	} );

	describe( '#updateNeighborhood()', function () {

		it( 'should update the neighborhood of a single game entity if necessary', function () {

			const manager = new EntityManager();

			const entity1 = new GameEntity();
			entity1.updateNeighborhood = true;
			const entity2 = new GameEntity();

			manager.add( entity1 );
			manager.add( entity2 );

			manager.updateNeighborhood( entity1 );

			expect( entity1.neighbors ).to.include( entity2 );
			expect( entity2.neighbors ).to.be.empty;

		} );

		it( 'should not add inactive game entities to the neighbors', function () {

			const manager = new EntityManager();

			const entity1 = new GameEntity();
			entity1.updateNeighborhood = true;
			const entity2 = new GameEntity();
			entity2.active = false;

			manager.add( entity1 );
			manager.add( entity2 );

			manager.updateNeighborhood( entity1 );

			expect( entity1.neighbors ).to.not.include( entity2 );

		} );

		it( 'should use the neighborhoodRadius of the game entity to determine the neighborhood', function () {

			const manager = new EntityManager();

			const entity1 = new GameEntity();
			entity1.updateNeighborhood = true;
			entity1.neighborhoodRadius = 2;
			const entity2 = new GameEntity();
			entity2.position.set( 0, 0, 1 );
			const entity3 = new GameEntity();
			entity3.position.set( 0, 0, 4 );

			manager.add( entity1 );
			manager.add( entity2 );
			manager.add( entity3 );

			manager.updateNeighborhood( entity1 );

			expect( entity1.neighbors ).to.include( entity2 );
			expect( entity1.neighbors ).to.not.include( entity3 );

		} );

		it( 'should use a spatial index if possible', function () {

			const height = 10, width = 10, depth = 10;
			const cellsX = 5, cellsY = 5, cellsZ = 5;

			const manager = new EntityManager();
			const delta = 1;
			manager.spatialIndex = new CellSpacePartitioning( height, width, depth, cellsX, cellsY, cellsZ );

			const entity1 = new GameEntity();
			entity1.updateNeighborhood = true;
			const entity2 = new GameEntity();
			entity2.position.set( 0, 0, 1 );
			const entity3 = new GameEntity();
			entity3.position.set( 0, 0, 3 );

			manager.add( entity1 );
			manager.add( entity2 );
			manager.add( entity3 );

			// the entities needs to be updated once in order to have a valid assignment to a partition

			manager.updateEntity( entity1, delta );
			manager.updateEntity( entity2, delta );
			manager.updateEntity( entity3, delta );
			manager.updateNeighborhood( entity1 );

			expect( entity1.neighbors ).to.include( entity2 );
			expect( entity1.neighbors ).to.not.include( entity3 );

		} );

	} );

	describe( '#updateEntity()', function () {

		it( 'should update a single game entity', function () {

			const manager = new EntityManager();
			const delta = 1;

			const entity = new CustomEntity();

			manager.updateEntity( entity, delta );
			expect( entity.updated ).to.be.true;

		} );

		it( 'should only update the game entity if it is active', function () {

			const manager = new EntityManager();
			const delta = 1;

			const entity = new CustomEntity();
			entity.active = false;

			manager.updateEntity( entity, delta );
			expect( entity.updated ).to.be.false;

		} );

		it( 'should update the neighborhood of a game entity if necessary', function () {

			const manager = new EntityManager();
			const delta = 1;

			const entity1 = new GameEntity();
			entity1.updateNeighborhood = true;
			const entity2 = new GameEntity();

			manager.add( entity1 );
			manager.add( entity2 );

			manager.updateEntity( entity1, delta );

			expect( entity1.neighbors ).to.include( entity2 );
			expect( entity2.neighbors ).to.be.empty;

		} );

		it( 'should update a single game entity and its children', function () {

			const manager = new EntityManager();
			const delta = 1;

			const entity1 = new CustomEntity();
			const entity2 = new CustomEntity();

			entity1.add( entity2 );

			manager.updateEntity( entity1, delta );
			expect( entity1.updated ).to.be.true;
			expect( entity2.updated ).to.be.true;

		} );

		it( 'should update the assignment to a partition of a spatial index if necessary', function () {

			const height = 10, width = 10, depth = 10;
			const cellsX = 5, cellsY = 5, cellsZ = 5;

			const manager = new EntityManager();
			manager.spatialIndex = new CellSpacePartitioning( height, width, depth, cellsX, cellsY, cellsZ );
			const delta = 1;

			const entity = new CustomEntity();
			entity.position.set( - 5, - 5, - 5 );

			manager.updateEntity( entity, delta );

			expect( manager._indexMap.get( entity ) ).to.equal( 0 );

		} );

		it( 'should call the callback function for a render component if set', function () {

			const manager = new EntityManager();
			const delta = 1;

			const gameEntity = new GameEntity();
			const mesh = {};

			function callback( entity, renderComponent ) {

				expect( entity ).to.equals( gameEntity );
				expect( renderComponent ).to.equals( mesh );

			}

			gameEntity.setRenderComponent( mesh, callback );

			manager.updateEntity( gameEntity, delta );

		} );

		it( 'should add a trigger to the internal trigger array', function () {

			const manager = new EntityManager();
			const delta = 1;

			const trigger = new Trigger();

			manager.updateEntity( trigger, delta );

			expect( manager._triggers ).to.include( trigger );

		} );

	} );

	describe( '#processTrigger()', function () {

		it( 'should process a single trigger', function () {

			const manager = new EntityManager();
			const trigger = new CustomTrigger();

			manager.processTrigger( trigger );
			expect( trigger.regionUpdated ).to.be.true;

		} );

		it( 'should only process an entity if it is not the trigger', function () {

			const manager = new EntityManager();

			const entity1 = new CustomEntity();
			entity1.canActivateTrigger = false;
			const entity2 = new CustomEntity();
			manager.add( entity1 );
			manager.add( entity2 );

			const customTriggerRegion = new CustomTriggerRegion();
			const trigger = new CustomTrigger();
			trigger.region = customTriggerRegion;

			manager.processTrigger( trigger );
			expect( entity1.updated ).to.be.false;
			expect( entity2.updated ).to.be.true;

		} );

		it( 'should only process an entity which can trigger a trigger', function () {

			const manager = new EntityManager();
			const trigger = new CustomTrigger();

			manager.add( trigger );

			manager.processTrigger( trigger ); // nothing happens here

		} );

	} );

	describe( '#sendMessage()', function () {

		it( 'should send a message from a sender to a receiver entity', function () {

			const manager = new EntityManager();

			const sender = new GameEntity();
			const receiver = new CustomEntity();

			manager.sendMessage( sender, receiver, 'test', 0, {} );

			expect( receiver.messageHandled ).to.be.true;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const entity1 = new GameEntity();
			const entity2 = new GameEntity();

			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			entity2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			entity1.add( entity2 );

			entity1.neighbors.push( entity2 );
			entity2.neighbors.push( entity1 );

			const manager = new EntityManager();
			manager.add( entity1 );
			manager.update();

			expect( manager.toJSON() ).to.be.deep.equal( CoreJSONs.EntityManager );

		} );

		it( 'should serialize this instance to a JSON object, bigger test', function () {

			const entity1 = new MovingEntity();
			const entity2 = new Vehicle();
			const entity3 = new CustomEntity();
			const entity4 = new Trigger();
			const entity5 = new CustomTrigger();

			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			entity2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';
			entity3._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A482';
			entity4._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A483';
			entity5._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A484';

			entity1.neighbors.push( entity2, entity3 );
			entity2.neighbors.push( entity1 );
			entity3.neighbors.push( entity1 );

			const manager = new EntityManager();
			manager.registerType( 'CustomEntity', CustomEntity );
			manager.registerType( 'CustomTrigger', CustomTrigger );
			manager.add( entity1 );
			manager.add( entity2 );
			manager.add( entity3 );
			manager.add( entity4 );
			manager.add( entity5 );

			expect( manager.toJSON() ).to.be.deep.equal( CoreJSONs.EntityManager2 );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const entity1 = new GameEntity();
			const entity2 = new GameEntity();

			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			entity2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			entity1.add( entity2 );

			entity1.neighbors.push( entity2 );
			entity2.neighbors.push( entity1 );

			const manager = new EntityManager();
			manager.add( entity1 );
			manager.update();

			const managerRestored = new EntityManager().fromJSON( CoreJSONs.EntityManager );

			expect( managerRestored ).to.be.deep.equal( manager );

		} );

		it( 'should deserialize this instance to a JSON object, bigger test', function () {

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			const entity1 = new MovingEntity();
			const entity2 = new Vehicle();
			const entity3 = new CustomEntity();
			const entity4 = new Trigger();
			const entity5 = new CustomTrigger();

			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			entity2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';
			entity3._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A482';
			entity4._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A483';
			entity5._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A484';

			entity1.neighbors.push( entity2, entity3 );
			entity2.neighbors.push( entity1 );
			entity3.neighbors.push( entity1 );

			const manager = new EntityManager();
			manager.registerType( 'CustomEntity', CustomEntity );
			manager.registerType( 'CustomTrigger', CustomTrigger );
			manager.add( entity1 );
			manager.add( entity2 );
			manager.add( entity3 );
			manager.add( entity4 );
			manager.add( entity5 );

			const manager2 = new EntityManager();
			manager2.registerType( 'CustomEntity', CustomEntity );
			manager2.registerType( 'CustomTrigger', CustomTrigger );
			manager2.fromJSON( CoreJSONs.EntityManager2 );

			const manager3 = new EntityManager().fromJSON( CoreJSONs.EntityManager2 );

			expect( manager2 ).to.be.deep.equal( manager );
			expect( manager3.entities.length + 2 ).to.be.equal( manager2.entities.length );

		} );

	} );

	describe( '#registerType()', function () {

		it( 'should register a custom type for deserialization', function () {

			const manager = new EntityManager();

			manager.registerType( 'CustomEntity', CustomEntity );

			expect( manager._typesMap.get( 'CustomEntity' ) ).to.equal( CustomEntity );

		} );

	} );

} );

//

class CustomEntity extends GameEntity {

	constructor() {

		super();

		this.updated = false;
		this.messageHandled = false;
		this.startCounter = 0;

	}

	start() {

		this.startCounter ++;

	}

	update() {

		this.updated = true;

	}

	handleMessage() {

		this.messageHandled = true;

		return true;

	}

}

class CustomTrigger extends Trigger {

	constructor() {

		super();

		this.regionUpdated = false;

	}

	updateRegion() {

		this.regionUpdated = true;

	}

	execute( entity ) {

		entity.updated = true;

	}

}

class CustomTriggerRegion extends TriggerRegion {

	touching() {

		return true;

	}

}
