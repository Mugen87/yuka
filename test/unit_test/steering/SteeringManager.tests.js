/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const SteeringJSONs = require( '../../files/SteeringJSONs.js' );

const SteeringManager = YUKA.SteeringManager;
const SteeringBehavior = YUKA.SteeringBehavior;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;
const PursuitBehavior = YUKA.PursuitBehavior;
const EvadeBehavior = YUKA.EvadeBehavior;
const InterposeBehavior = YUKA.InterposeBehavior;
const ObstacleAvoidanceBehavior = YUKA.ObstacleAvoidanceBehavior;
const OffsetPursuitBehavior = YUKA.OffsetPursuitBehavior;
const AlignmentBehavior = YUKA.AlignmentBehavior;
const ArriveBehavior = YUKA.ArriveBehavior;
const CohesionBehavior = YUKA.CohesionBehavior;
const FollowPathBehavior = YUKA.FollowPathBehavior;
const FleeBehavior = YUKA.FleeBehavior;
const SeekBehavior = YUKA.SeekBehavior;
const SeparationBehavior = YUKA.SeparationBehavior;
const WanderBehavior = YUKA.WanderBehavior;

let count = 0;

describe( 'SteeringManager', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const steeringManager = new SteeringManager();
			expect( steeringManager ).to.have.a.property( 'vehicle' ).that.is.undefined;
			expect( steeringManager ).to.have.a.property( 'behaviors' ).that.is.an( 'array' ).and.empty;
			expect( steeringManager ).to.have.a.property( '_steeringForce' ).that.is.an.instanceof( Vector3 );
			expect( steeringManager ).to.have.a.property( '_typesMap' ).that.is.a( 'map' );

		} );

	} );

	describe( '#add()', function () {

		it( 'should add a steering behavior to the internal array', function () {

			const steeringManager = new SteeringManager();
			const steeringBehavior = new SteeringBehavior();

			steeringManager.add( steeringBehavior );
			expect( steeringManager.behaviors[ 0 ] ).to.equal( steeringBehavior );

		} );

	} );

	describe( '#remove()', function () {

		it( 'should remove a steering behavior from the internal array', function () {

			const steeringManager = new SteeringManager();
			const steeringBehavior = new SteeringBehavior();

			steeringManager.add( steeringBehavior );
			steeringManager.remove( steeringBehavior );
			expect( steeringManager.behaviors ).to.be.empty;

		} );

	} );

	describe( '#clear()', function () {

		it( 'should clear the internal state of this steering manager', function () {

			const steeringManager = new SteeringManager();
			const steeringBehavior1 = new SteeringBehavior();
			const steeringBehavior2 = new SteeringBehavior();

			steeringManager.add( steeringBehavior1 );
			steeringManager.add( steeringBehavior2 );

			steeringManager.clear();

			expect( steeringManager.behaviors ).to.be.empty;

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should calculate the steering force for the internal vehicle', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			const force = new Vector3();
			steeringManager.calculate( 1, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 60 } );

		} );

		it( 'should use the time delta value for force calculation', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			steeringManager._calculateByOrder( 0.5 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 30 } );

		} );

	} );

	describe( '#_accumulate()', function () {

		it( 'should add a force to the main steering force vector', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const force = new Vector3( 0, 0, 50 );

			expect( steeringManager._accumulate( force ) ).to.be.true;
			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 50 } );

		} );

		it( 'should add a force to the main steering force vector without exceeding the maximum force of the vehicle ', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const force = new Vector3( 0, 0, 200 );

			expect( steeringManager._accumulate( force ) ).to.be.true;
			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 100 } );

			expect( steeringManager._accumulate( force ) ).to.be.false;
			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 100 } );

		} );

	} );

	describe( '#_calculateByOrder()', function () {

		it( 'should process the internal steering behaviors according to their internal order and accumulate their force', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			count = 0; // module scope variable
			steeringManager._calculateByOrder( 1 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 60 } );
			expect( steeringBehavior1.order ).to.equal( 0 );
			expect( steeringBehavior2.order ).to.equal( 1 );

		} );

		it( 'should use the weight property of a steering behavior for force calculation', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringBehavior1.weight = 2; // this will double the steering force for this behavior
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			steeringManager._calculateByOrder( 1 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 70 } );

		} );

		it( 'should perform an early out if the maximum force of the vehicle is reached', function () {

			const vehicle = new Vehicle();
			vehicle.maxForce = 5;
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			steeringManager._calculateByOrder( 1 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 5 } );

		} );

		it( 'should ignore inactive steering behaviors', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringBehavior2.active = false;
			steeringManager.add( steeringBehavior2 );

			steeringManager._calculateByOrder( 1 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 10 } );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const manager = new SteeringManager();
			const behavior = new SteeringBehavior();

			manager.add( behavior );
			expect( manager.toJSON() ).to.be.deep.equal( SteeringJSONs.SteeringManager );

		} );

		it( 'should serialize this instance to a JSON object, bigger test', function () {

			const manager = new SteeringManager();
			const behavior = new SteeringBehavior();
			const vehicle1 = new Vehicle();
			const vehicle2 = new Vehicle();
			const evade = new EvadeBehavior( vehicle1 );
			const interpose = new InterposeBehavior( vehicle1, vehicle2 );
			const obstacle = new ObstacleAvoidanceBehavior();
			obstacle.obstacles.push( vehicle1 );
			const offset = new OffsetPursuitBehavior( vehicle1 );
			const pursuit = new PursuitBehavior( vehicle1 );

			manager.registerType( 'CustomSteeringBehavior1', CustomSteeringBehavior1 );
			const custom = new CustomSteeringBehavior1();

			const alignment = new AlignmentBehavior();
			const arrive = new ArriveBehavior();
			const cohesion = new CohesionBehavior();
			const flee = new FleeBehavior();
			const follow = new FollowPathBehavior();
			const seek = new SeekBehavior();
			const separation = new SeparationBehavior();
			const wander = new WanderBehavior();
			wander._targetLocal.set( 0.9171491244303018, 0, 1.7773118700882888 );

			manager.add( behavior );
			manager.add( evade );
			manager.add( interpose );
			manager.add( obstacle );
			manager.add( offset );
			manager.add( pursuit );

			manager.add( alignment );
			manager.add( arrive );
			manager.add( cohesion );
			manager.add( flee );
			manager.add( follow );
			manager.add( seek );
			manager.add( separation );
			manager.add( wander );
			manager.add( custom );

			vehicle1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			vehicle2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			expect( manager.toJSON() ).to.be.deep.equal( SteeringJSONs.SteeringManager2 );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const manager = new SteeringManager();
			const behavior = new SteeringBehavior();

			manager.add( behavior );
			const manager2 = new SteeringManager().fromJSON( SteeringJSONs.SteeringManager );
			expect( manager2 ).to.be.deep.equal( manager );

		} );

		it( 'should deserialize this instance from the given JSON object, bigger test', function () {

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			const manager = new SteeringManager();

			const behavior = new SteeringBehavior();
			const vehicle1 = new Vehicle();
			const vehicle2 = new Vehicle();
			const evade = new EvadeBehavior( vehicle1 );
			const interpose = new InterposeBehavior( vehicle1, vehicle2 );
			const obstacle = new ObstacleAvoidanceBehavior();
			obstacle.obstacles.push( vehicle1 );
			const offset = new OffsetPursuitBehavior( vehicle1 );
			const pursuit = new PursuitBehavior( vehicle1 );

			manager.registerType( 'CustomSteeringBehavior1', CustomSteeringBehavior1 );
			const custom = new CustomSteeringBehavior1();
			const manager2 = new SteeringManager();
			manager2.registerType( 'CustomSteeringBehavior1', CustomSteeringBehavior1 );
			manager2.fromJSON( SteeringJSONs.SteeringManager2 );
			const manager3 = new SteeringManager().fromJSON( SteeringJSONs.SteeringManager2 );

			const alignment = new AlignmentBehavior();
			const arrive = new ArriveBehavior();
			const cohesion = new CohesionBehavior();
			const flee = new FleeBehavior();
			const follow = new FollowPathBehavior();
			const seek = new SeekBehavior();
			const separation = new SeparationBehavior();
			const wander = new WanderBehavior();
			wander._targetLocal.set( 0.9171491244303018, 0, 1.7773118700882888 );

			manager.add( behavior );
			manager.add( evade );
			manager.add( interpose );
			manager.add( obstacle );
			manager.add( offset );
			manager.add( pursuit );

			manager.add( alignment );
			manager.add( arrive );
			manager.add( cohesion );
			manager.add( flee );
			manager.add( follow );
			manager.add( seek );
			manager.add( separation );
			manager.add( wander );
			manager.add( custom );

			vehicle1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			vehicle2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const map = new Map();
			map.set( vehicle1.uuid, vehicle1 );
			map.set( vehicle2.uuid, vehicle2 );

			manager2.resolveReferences( map );
			expect( manager2 ).to.deep.equal( manager );
			expect( manager3.behaviors.length + 1 ).to.be.equal( manager2.behaviors.length );

		} );


	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const entity1 = new Vehicle();
			const steeringManger1 = new SteeringManager();
			const steeringManger2 = new SteeringManager();
			const pursuitBehavior1 = new PursuitBehavior( entity1 );
			const pursuitBehavior2 = new PursuitBehavior();

			//set ids
			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			//set references
			pursuitBehavior2.evader = entity1.uuid;
			steeringManger1.add( pursuitBehavior1 );
			steeringManger2.add( pursuitBehavior2 );

			const map = new Map();
			map.set( entity1.uuid, entity1 );

			steeringManger2.resolveReferences( map );

			expect( steeringManger2 ).to.deep.equal( steeringManger1 );

		} );

	} );

	describe( '#registerType()', function () {

		it( 'should register a custom type for deserialization', function () {

			const steeringManager = new SteeringManager();

			steeringManager.registerType( 'CustomEntity', CustomSteeringBehavior1 );

			expect( steeringManager._typesMap.get( 'CustomEntity' ) ).to.equal( CustomSteeringBehavior1 );

		} );

	} );

} );

//

class CustomSteeringBehavior1 extends SteeringBehavior {

	constructor() {

		super();

		this.order = 0;

	}

	calculate( vehicle, force, delta ) {

		this.order = count ++;
		force.set( 0, 0, 10 ).multiplyScalar( delta );

	}

	toJSON() {

		const json = super.toJSON();
		json.order = this.order;
		return json;

	}

	fromJSON( json ) {

		super.fromJSON( json );
		this.order = json.order;

		return this;

	}

}

class CustomSteeringBehavior2 extends SteeringBehavior {

	constructor() {

		super();

		this.order = 0;

	}

	calculate( vehicle, force, delta ) {

		this.order = count ++;
		force.set( 0, 0, 50 ).multiplyScalar( delta );

	}

}
