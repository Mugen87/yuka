import { Logger } from '../core/Logger.js';
import { LeftShoulderFuzzySet } from './sets/LeftShoulderFuzzySet.js';
import { RightShoulderFuzzySet } from './sets/RightShoulderFuzzySet.js';
import { SingletonFuzzySet } from './sets/SingletonFuzzySet.js';
import { TriangularFuzzySet } from './sets/TriangularFuzzySet.js';

/**
* Class for representing a fuzzy linguistic variable (FLV). A FLV is the
* composition of one or more fuzzy sets to represent a concept or domain
* qualitatively. For example fuzzs sets "Dumb", "Average", and "Clever"
* are members of the fuzzy linguistic variable "IQ".
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class FuzzyVariable {

	/**
	* Constructs a new fuzzy linguistic variable.
	*/
	constructor() {

		/**
		* An array of the fuzzy sets that comprise this FLV.
		* @type {Array<FuzzySet>}
		* @readonly
		*/
		this.fuzzySets = new Array();

		/**
		* The minimum value range of this FLV. This value is
		* automatically updated when adding/removing fuzzy sets.
		* @type {Number}
		* @default Infinity
		* @readonly
		*/
		this.minRange = Infinity;

		/**
		* The maximum value range of this FLV. This value is
		* automatically updated when adding/removing fuzzy sets.
		* @type {Number}
		* @default - Infinity
		* @readonly
		*/
		this.maxRange = - Infinity;

	}

	/**
	* Adds the given fuzzy set to this FLV.
	*
	* @param {FuzzySet} fuzzySet - The fuzzy set to add.
	* @return {FuzzyVariable} A reference to this FLV.
	*/
	add( fuzzySet ) {

		this.fuzzySets.push( fuzzySet );

		// adjust range

		if ( fuzzySet.left < this.minRange ) this.minRange = fuzzySet.left;
		if ( fuzzySet.right > this.maxRange ) this.maxRange = fuzzySet.right;

		return this;

	}

	/**
	* Removes the given fuzzy set from this FLV.
	*
	* @param {FuzzySet} fuzzySet - The fuzzy set to remove.
	* @return {FuzzyVariable} A reference to this FLV.
	*/
	remove( fuzzySet ) {

		const fuzzySets = this.fuzzySets;

		const index = fuzzySets.indexOf( fuzzySet );
		fuzzySets.splice( index, 1 );

		// iterate over all fuzzy sets to recalculate the min/max range

		this.minRange = Infinity;
		this.maxRange = - Infinity;

		for ( let i = 0, l = fuzzySets.length; i < l; i ++ ) {

			const fuzzySet = fuzzySets[ i ];

			if ( fuzzySet.left < this.minRange ) this.minRange = fuzzySet.left;
			if ( fuzzySet.right > this.maxRange ) this.maxRange = fuzzySet.right;

		}

		return this;

	}

	/**
	* Fuzzifies a value by calculating its degree of membership in each of
	* this variable's fuzzy sets.
	*
	* @param {Number} value - The crips value to fuzzify.
	* @return {FuzzyVariable} A reference to this FLV.
	*/
	fuzzify( value ) {

		if ( value < this.minRange || value > this.maxRange ) {

			Logger.warn( 'YUKA.FuzzyVariable: Value for fuzzification out of range.' );
			return;

		}

		const fuzzySets = this.fuzzySets;

		for ( let i = 0, l = fuzzySets.length; i < l; i ++ ) {

			const fuzzySet = fuzzySets[ i ];

			fuzzySet.degreeOfMembership = fuzzySet.computeDegreeOfMembership( value );

		}

		return this;

	}

	/**
	* Defuzzifies the FLV using the "Average of Maxima" (MaxAv) method.
	*
	* @return {Number} The defuzzified, crips value.
	*/
	defuzzifyMaxAv() {

		// the average of maxima (MaxAv for short) defuzzification method scales the
		// representative value of each fuzzy set by its DOM and takes the average

		const fuzzySets = this.fuzzySets;

		let bottom = 0;
		let top = 0;

		for ( let i = 0, l = fuzzySets.length; i < l; i ++ ) {

			const fuzzySet = fuzzySets[ i ];

			bottom += fuzzySet.degreeOfMembership;
			top += fuzzySet.representativeValue * fuzzySet.degreeOfMembership;

		}

		return ( bottom === 0 ) ? 0 : ( top / bottom );

	}

	/**
	* Defuzzifies the FLV using the "Centroid" method.
	*
	* @param {Number} samples - The amount of samples used for defuzzification.
	* @return {Number} The defuzzified, crips value.
	*/
	defuzzifyCentroid( samples = 10 ) {

		const fuzzySets = this.fuzzySets;

		const stepSize = ( this.maxRange - this.minRange ) / samples;

		let totalArea = 0;
		let sumOfMoments = 0;

		for ( let s = 1; s <= samples; s ++ ) {

			const sample = this.minRange + ( s * stepSize );

			for ( let i = 0, l = fuzzySets.length; i < l; i ++ ) {

				const fuzzySet = fuzzySets[ i ];

				const contribution = Math.min( fuzzySet.degreeOfMembership, fuzzySet.computeDegreeOfMembership( sample ) );

				totalArea += contribution;

				sumOfMoments += ( sample * contribution );

			}

		}

		return ( totalArea === 0 ) ? 0 : ( sumOfMoments / totalArea );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name,
			fuzzySets: new Array(),
			minRange: this.minRange.toString(),
			maxRange: this.maxRange.toString(),
		};

		for ( let i = 0, l = this.fuzzySets.length; i < l; i ++ ) {

			const fuzzySet = this.fuzzySets[ i ];
			json.fuzzySets.push( fuzzySet.toJSON() );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {FuzzyVariable} A reference to this fuzzy variable.
	*/
	fromJSON( json ) {

		this.minRange = parseFloat( json.minRange );
		this.maxRange = parseFloat( json.maxRange );

		for ( let i = 0, l = json.fuzzySets.length; i < l; i ++ ) {

			const fuzzySetJson = json.fuzzySets[ i ];

			let type = fuzzySetJson.type;

			switch ( type ) {

				case 'LeftShoulderFuzzySet':
					this.fuzzySets.push( new LeftShoulderFuzzySet().fromJSON( fuzzySetJson ) );
					break;

				case 'RightShoulderFuzzySet':
					this.fuzzySets.push( new RightShoulderFuzzySet().fromJSON( fuzzySetJson ) );
					break;

				case 'SingletonFuzzySet':
					this.fuzzySets.push( new SingletonFuzzySet().fromJSON( fuzzySetJson ) );
					break;

				case 'TriangularFuzzySet':
					this.fuzzySets.push( new TriangularFuzzySet().fromJSON( fuzzySetJson ) );
					break;

				default:
					Logger.error( 'YUKA.FuzzyVariable: Unsupported fuzzy set type:', fuzzySetJson.type );

			}

		}

		return this;

	}

}

export { FuzzyVariable };
