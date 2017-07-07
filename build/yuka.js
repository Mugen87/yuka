(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.YUKA = global.YUKA || {})));
}(this, (function (exports) { 'use strict';

class EntityManager {

	constructor () {

		this.entities = [];

	}

	add ( entity ) {

		this.entities.push( entity );

	}

}

exports.EntityManager = EntityManager;

Object.defineProperty(exports, '__esModule', { value: true });

})));
