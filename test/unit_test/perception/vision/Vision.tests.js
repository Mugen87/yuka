/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const PerceptionJSONs = require( '../../../files/PerceptionJSONs.js' );


const Vision = YUKA.Vision;
const GameEntity = YUKA.GameEntity;
const MeshGeometry = YUKA.MeshGeometry;
const Vector3 = YUKA.Vector3;

describe( 'Vision', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const vision = new Vision();
			expect( vision.owner ).to.be.null;
			expect( vision ).to.have.a.property( 'fieldOfView' ).that.is.equal( Math.PI );
			expect( vision ).to.have.a.property( 'range' ).that.is.equal( Infinity );
			expect( vision.obstacles ).to.be.an( 'array' ).with.lengthOf( 0 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity = new GameEntity();
			const vision = new Vision( entity );
			expect( vision.owner ).to.equal( entity );

		} );

	} );

	describe( '#addObstacle()', function () {

		it( 'should add an obstacle to this vision instance', function () {

			const vision = new Vision();

			const obstacle = new Obstacle();
			vision.addObstacle( obstacle );

			expect( vision.obstacles ).to.include( obstacle );

		} );

	} );

	describe( '#removeObstacle()', function () {

		it( 'should remove an obstacle from this vision instance', function () {

			const vision = new Vision();

			const obstacle = new Obstacle();
			vision.addObstacle( obstacle );
			vision.removeObstacle( obstacle );

			expect( vision.obstacles ).to.not.include( obstacle );

		} );

	} );

	describe( '#visible()', function () {

		it( 'should return false if the given point lies outside the visual range of the game entity', function () {

			const entity = new GameEntity();
			const vision = new Vision( entity );
			vision.range = 1;

			const point = new Vector3( 0, 0, 2 );

			expect( vision.visible( point ) ).to.be.false;

		} );

		it( 'should return false if the given point lies inside the visual range but outside the field of view of the game entity', function () {

			const entity = new GameEntity();
			const vision = new Vision( entity );
			vision.range = 3;
			vision.fieldOfView = Math.PI * 0.25;

			const point = new Vector3( 0, 1, 2 );

			expect( vision.visible( point ) ).to.be.false;

		} );

		it( 'should return true if the given point lies inside the visual range and the field of view of the game entity', function () {

			const entity = new GameEntity();
			const vision = new Vision( entity );
			vision.range = 3;
			vision.fieldOfView = Math.PI * 0.25;

			const point = new Vector3( 0, 0, 2 );

			expect( vision.visible( point ) ).to.be.true;

		} );

		it( 'should return false if the given point lies inside the visual range and the field of view of the game entity but an obstacle blocks the line of sight', function () {

			const entity = new GameEntity();
			entity.position.set( 0, 0, - 1 );

			const vision = new Vision( entity );
			vision.range = 5;
			vision.fieldOfView = Math.PI * 0.25;

			const vertices = new Float32Array( [
				1, 1, 0,	1, - 1, 0,	- 1, - 1, 0,
				- 1, - 1, 0,	- 1, 1, 0,	1, 1, 0
			] );
			const geometry = new MeshGeometry( vertices );
			const obstacle = new Obstacle( geometry );
			vision.addObstacle( obstacle );

			const point = new Vector3( 0, 0, 2 );

			expect( vision.visible( point ) ).to.be.false;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const entity = new GameEntity();
			const vision = new Vision( entity );
			vision.range = 3;
			vision.fieldOfView = Math.PI * 0.25;

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const geometry = new MeshGeometry( vertices );
			const obstacle = new Obstacle( geometry );
			vision.addObstacle( obstacle );
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			obstacle._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D31';

			const json = vision.toJSON();


			expect( json ).to.be.deep.equal( PerceptionJSONs.Vision );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const entity = new GameEntity();
			const vision = new Vision( entity );
			vision.range = 3;
			vision.fieldOfView = Math.PI * 0.25;

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const geometry = new MeshGeometry( vertices );
			const obstacle = new Obstacle( geometry );

			vision.addObstacle( obstacle );
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			obstacle._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D31';

			const map = new Map();
			map.set( entity.uuid, entity );
			map.set( obstacle.uuid, obstacle );

			const vision2 = new Vision().fromJSON( PerceptionJSONs.Vision );
			vision2.resolveReferences( map );

			expect( vision2 ).to.be.deep.equal( vision );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the reference to the owner and obstacle entities', function () {

			const entity = new GameEntity();
			entity.position.set( 0.5, 2, 0.5 );
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const geometry = new MeshGeometry( vertices );

			const vision = new Vision( entity.uuid );
			vision.range = 3;
			vision.fieldOfView = Math.PI * 0.25;
			const obstacle = new Obstacle( geometry );

			obstacle._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D31';
			vision.addObstacle( obstacle.uuid );

			const map = new Map();
			map.set( entity.uuid, entity );
			map.set( obstacle.uuid, obstacle );
			vision.resolveReferences( map );

			expect( vision.owner ).to.equal( entity );
			expect( vision.obstacles[ 0 ] ).to.equal( obstacle );

		} );

		it( 'should set the owner to null if the mapping is missing', function () {

			const vision = new Vision();
			vision.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			vision.resolveReferences( new Map() );

			expect( vision.owner ).to.be.null;

		} );

	} );

} );


class Obstacle extends GameEntity {

	constructor( geometry = new MeshGeometry() ) {

		super();


		this.geometry = geometry;

	}

	lineOfSightTest( ray, intersectionPoint ) {

		return this.geometry.intersectRay( ray, this.worldMatrix, true, intersectionPoint );

	}

	toJSON() {

		const json = super.toJSON();

		json.geometry = this.geometry.toJSON();

		return json;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.geometry.fromJSON( json.geometry );

		return this;

	}

}
