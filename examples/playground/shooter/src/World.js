/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as YUKA from '../../../../build/yuka.module.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.109/build/three.module.js';
import { AssetManager } from './AssetManager.js';
import { Bullet } from './Bullet.js';
import { Ground } from './Ground.js';
import { Player } from './Player.js';
import { Target } from './Target.js';
import { FirstPersonControls } from './FirstPersonControls.js';

const target = new YUKA.Vector3();
const intersection = {
	point: new YUKA.Vector3(),
	normal: new YUKA.Vector3()
};

class World {

	constructor() {

		this.maxBulletHoles = 20;

		this.entityManager = new YUKA.EntityManager();
		this.time = new YUKA.Time();

		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.audios = new Map();
		this.animations = new Map();

		this.player = null;
		this.controls = null;
		this.obstacles = new Array();
		this.bulletHoles = new Array();

		this.assetManager = new AssetManager();

		this._animate = animate.bind( this );
		this._onIntroClick = onIntroClick.bind( this );
		this._onWindowResize = onWindowResize.bind( this );

		this.ui = {
			intro: document.getElementById( 'intro' ),
			crosshairs: document.getElementById( 'crosshairs' ),
			loadingScreen: document.getElementById( 'loading-screen' )
		};

	}

	init() {

		this.assetManager.init().then( () => {

			this._initScene();
			this._initGround();
			this._initPlayer();
			this._initControls();
			this._initTarget();
			this._initUI();

			this._animate();

		} );

	}

	update() {

		const delta = this.time.update().getDelta();

		this.controls.update( delta );

		this.entityManager.update( delta );

		if ( this.mixer ) this.mixer.update( delta );

		this.renderer.render( this.scene, this.camera );

	}

	add( entity ) {

		this.entityManager.add( entity );

		if ( entity._renderComponent !== null ) {

			this.scene.add( entity._renderComponent );

		}

		if ( entity.geometry ) {

			this.obstacles.push( entity );

		}

	}

	remove( entity ) {

		this.entityManager.remove( entity );

		if ( entity._renderComponent !== null ) {

			this.scene.remove( entity._renderComponent );

		}

		if ( entity.geometry ) {

			const index = this.obstacles.indexOf( entity );

			if ( index !== - 1 ) this.obstacles.splice( index, 1 );


		}

	}

	addBullet( owner, ray ) {

		const bulletLine = this.assetManager.models.get( 'bulletLine' ).clone();

		const bullet = new Bullet( owner, ray );
		bullet.setRenderComponent( bulletLine, sync );

		this.add( bullet );

	}

	addBulletHole( position, normal, audio ) {

		const bulletHole = this.assetManager.models.get( 'bulletHole' ).clone();
		bulletHole.add( audio );

		const s = 1 + ( Math.random() * 0.5 );
		bulletHole.scale.set( s, s, s );

		bulletHole.position.copy( position );
		target.copy( position ).add( normal );
		bulletHole.updateMatrix();
		bulletHole.lookAt( target.x, target.y, target.z );
		bulletHole.updateMatrix();

		if ( this.bulletHoles.length >= this.maxBulletHoles ) {

			const toRemove = this.bulletHoles.shift();
			this.scene.remove( toRemove );

		}

		this.bulletHoles.push( bulletHole );
		this.scene.add( bulletHole );

	}

	intersectRay( ray, intersectionPoint, normal = null ) {

		const obstacles = this.obstacles;
		let minDistance = Infinity;
		let closestObstacle = null;

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			const obstacle = obstacles[ i ];

			if ( obstacle.geometry.intersectRay( ray, obstacle.worldMatrix, false, intersection.point, intersection.normal ) !== null ) {

				const squaredDistance = intersection.point.squaredDistanceTo( ray.origin );

				if ( squaredDistance < minDistance ) {

					minDistance = squaredDistance;
					closestObstacle = obstacle;

					intersectionPoint.copy( intersection.point );
					if ( normal ) normal.copy( intersection.normal );

				}

			}

		}

		return ( closestObstacle === null ) ? null : closestObstacle;

	}

	_initScene() {

		// camera

		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 );
		this.camera.matrixAutoUpdate = false;
		this.camera.add( this.assetManager.listener );

		// audios

		this.audios = this.assetManager.audios;

		// scene

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xa0a0a0 );
		this.scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

		// lights

		const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.8 );
		hemiLight.position.set( 0, 100, 0 );
		this.scene.add( hemiLight );

		const dirLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
		dirLight.castShadow = true;
		dirLight.shadow.camera.top = 5;
		dirLight.shadow.camera.bottom = - 5;
		dirLight.shadow.camera.left = - 5;
		dirLight.shadow.camera.right = 5;
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 25;
		dirLight.position.set( 5, 7.5, - 10 );
		dirLight.target.position.set( 0, 0, - 25 );
		dirLight.target.updateMatrixWorld();
		this.scene.add( dirLight );

		// this.scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

		// renderer

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.shadowMap.enabled = true;
		this.renderer.gammaOutput = true;
		document.body.appendChild( this.renderer.domElement );

		// listeners

		window.addEventListener( 'resize', this._onWindowResize, false );
		this.ui.intro.addEventListener( 'click', this._onIntroClick, false );

	}

	_initGround() {

		const groundMesh = this.assetManager.models.get( 'ground' );

		const vertices = groundMesh.geometry.attributes.position.array;
		const indices = groundMesh.geometry.index.array;

		const geometry = new YUKA.MeshGeometry( vertices, indices );
		const ground = new Ground( geometry );
		ground.setRenderComponent( groundMesh, sync );

		this.add( ground );

	}

	_initPlayer() {

		const player = new Player();
		player.head.setRenderComponent( this.camera, syncCamera );

		this.add( player );
		this.player = player;

		// weapon

		const weapon = player.weapon;
		const weaponMesh = this.assetManager.models.get( 'weapon' );
		weapon.setRenderComponent( weaponMesh, sync );
		this.scene.add( weaponMesh );

		weaponMesh.add( this.audios.get( 'shot' ) );
		weaponMesh.add( this.audios.get( 'reload' ) );
		weaponMesh.add( this.audios.get( 'empty' ) );

		// animations

		this.mixer = new THREE.AnimationMixer( player.weapon );

		const shotClip = this.assetManager.animations.get( 'shot' );
		const shotAction = this.mixer.clipAction( shotClip );
		shotAction.loop = THREE.LoopOnce;

		this.animations.set( 'shot', shotAction );

		const reloadClip = this.assetManager.animations.get( 'reload' );
		const reloadAction = this.mixer.clipAction( reloadClip );
		reloadAction.loop = THREE.LoopOnce;

		this.animations.set( 'reload', reloadAction );

	}

	_initControls() {

		const player = this.player;

		this.controls = new FirstPersonControls( player );

		const intro = this.ui.intro;
		const crosshairs = this.ui.crosshairs;

		this.controls.addEventListener( 'lock', () => {

			intro.classList.add( 'hidden' );
			crosshairs.classList.remove( 'hidden' );

		} );

		this.controls.addEventListener( 'unlock', () => {

			intro.classList.remove( 'hidden' );
			crosshairs.classList.add( 'hidden' );

		} );

	}

	_initTarget() {

		const targetMesh = this.assetManager.models.get( 'target' );

		const vertices = targetMesh.geometry.attributes.position.array;
		const indices = targetMesh.geometry.index.array;

		const geometry = new YUKA.MeshGeometry( vertices, indices );
		const target = new Target( geometry );
		target.position.set( 0, 5, - 20 );
		target.setRenderComponent( targetMesh, sync );

		this.add( target );

	}

	_initUI() {

		const loadingScreen = this.ui.loadingScreen;

		loadingScreen.classList.add( 'fade-out' );
		loadingScreen.addEventListener( 'transitionend', onTransitionEnd );

	}

}

function sync( entity, renderComponent ) {

	renderComponent.matrix.copy( entity.worldMatrix );

}

function syncCamera( entity, renderComponent ) {

	renderComponent.matrixWorld.copy( entity.worldMatrix );

}

function onIntroClick() {

	this.controls.connect();

	const context = THREE.AudioContext.getContext();

	if ( context.state === 'suspended' ) context.resume();

}

function onWindowResize() {

	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize( window.innerWidth, window.innerHeight );

}

function onTransitionEnd( event ) {

	event.target.remove();

}

function animate() {

	requestAnimationFrame( this._animate );

	this.update();

}

export default new World();
