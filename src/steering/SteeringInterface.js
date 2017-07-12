/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const SteeringInterface = {

	TYPES: {
		NONE: 0,
		SEEK: 1,
		FLEE: 2,
		ARRIVE: 4
	},

	seekEnable: function () {

		this._behaviorFlag |= SteeringInterface.TYPES.SEEK;

	},

	seekDisable: function () {

		if ( this._isOn( SteeringInterface.TYPES.SEEK ) ) this._behaviorFlag ^= SteeringInterface.TYPES.SEEK;

	},

	seekOn: function () {

		return ( this._behaviorFlag & SteeringInterface.TYPES.SEEK ) === SteeringInterface.TYPES.SEEK;

	},

	fleeEnable: function () {

		this._behaviorFlag |= SteeringInterface.TYPES.FLEE;

	},

	fleeDisable: function () {

		if ( this._isOn( SteeringInterface.TYPES.FLEE ) ) this._behaviorFlag ^= SteeringInterface.TYPES.FLEE;

	},

	fleeOn: function () {

		return ( this._behaviorFlag & SteeringInterface.TYPES.FLEE ) === SteeringInterface.TYPES.FLEE;

	},

	arriveEnable: function () {

		this._behaviorFlag |= SteeringInterface.TYPES.ARRIVE;

	},

	arriveDisable: function () {

		if ( this._isOn( SteeringInterface.TYPES.ARRIVE ) ) this._behaviorFlag ^= SteeringInterface.TYPES.ARRIVE;

	},

	arriveOn: function () {

		return ( this._behaviorFlag & SteeringInterface.TYPES.ARRIVE ) === SteeringInterface.TYPES.ARRIVE;

	}

};

export { SteeringInterface };
