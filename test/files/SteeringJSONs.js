/**
 * @author robp94 / https://github.com/robp94
 */
module.exports = {
	SteeringBehavior: { "type": "SteeringBehavior", "active": true, "weight": 1 },
	AlignmentBehavior: { "type": "AlignmentBehavior", "active": true, "weight": 1 },
	ArriveBehavior: { "type": "ArriveBehavior", "active": true, "weight": 1, "target": [ 0, 0, 1 ], "deceleration": 2 },
	CohesionBehavior: { "type": "CohesionBehavior", "active": true, "weight": 1 },
	EvadeBehavior: { "type": "EvadeBehavior", "active": true, "weight": 1, "pursuer": null, "panicDistance": 1, "predictionFactor": 2 },
	FleeBehavior: { "type": "FleeBehavior", "active": true, "weight": 1, "target": [ 0, 0, 1 ], "panicDistance": 5 },
	FollowPathBehavior: { "type": "FollowPathBehavior", "active": true, "weight": 1, "path": { "type": "Path", "loop": false, "_waypoints": [], "_index": 0 }, "nextWaypointDistance": 2 },
	InterposeBehavior: { "type": "InterposeBehavior", "active": true, "weight": 1, "entity1": null, "entity2": null, "deceleration": 1 },
	ObstacleAvoidanceBehavior: { "type": "ObstacleAvoidanceBehavior", "active": true, "weight": 1, "obstacles": [], "brakingWeight": 1, "dBoxMinLength": 1 },
	OffsetPursuitBehavior: { "type": "OffsetPursuitBehavior", "active": true, "weight": 1, "leader": null, "offset": { "x": 0, "y": 0, "z": 1 } },
	OnPathBehavior: { "type": "OnPathBehavior", "active": true, "weight": 1, "path": { "type": "Path", "loop": false, "_waypoints": [], "_index": 0 }, "radius": 1, "predictionFactor": 2 },
	PursuitBehavior: { "type": "PursuitBehavior", "active": true, "weight": 1, "evader": "4C06581E-448A-4557-835E-7A9D2CE20D30", "predictionFactor": 2 },
	SeekBehavior: { "type": "SeekBehavior", "active": true, "weight": 1, "target": [ 0, 0, 1 ] },
	SeparationBehavior: { "type": "SeparationBehavior", "active": true, "weight": 1 },
	WanderBehavior: { "type": "WanderBehavior", "active": true, "weight": 1, "radius": 2, "distance": 2, "jitter": 2, "_targetLocal": [ 0.9171491244303018, 0, 1.7773118700882888 ] },
	SteeringManager: { "type": "SteeringManager", "behaviors": [ { "type": "SteeringBehavior", "active": true, "weight": 1 } ] },
	SteeringManager2: { "type": "SteeringManager", "behaviors": [ { "type": "SteeringBehavior", "active": true, "weight": 1 }, { "type": "EvadeBehavior", "active": true, "weight": 1, "pursuer": "4C06581E-448A-4557-835E-7A9D2CE20D30", "panicDistance": 10, "predictionFactor": 1 }, { "type": "InterposeBehavior", "active": true, "weight": 1, "entity1": "4C06581E-448A-4557-835E-7A9D2CE20D30", "entity2": "52A33A16-6843-4C98-9A8E-9FCEA255A481", "deceleration": 3 }, { "type": "ObstacleAvoidanceBehavior", "active": true, "weight": 1, "obstacles": [ "4C06581E-448A-4557-835E-7A9D2CE20D30" ], "brakingWeight": 0.2, "dBoxMinLength": 4 }, { "type": "OffsetPursuitBehavior", "active": true, "weight": 1, "leader": "4C06581E-448A-4557-835E-7A9D2CE20D30", "offset": { "x": 0, "y": 0, "z": 0 } }, { "type": "PursuitBehavior", "active": true, "weight": 1, "evader": "4C06581E-448A-4557-835E-7A9D2CE20D30", "predictionFactor": 1 }, { "type": "AlignmentBehavior", "active": true, "weight": 1 }, { "type": "ArriveBehavior", "active": true, "weight": 1, "target": [ 0, 0, 0 ], "deceleration": 3 }, { "type": "CohesionBehavior", "active": true, "weight": 1 }, { "type": "FleeBehavior", "active": true, "weight": 1, "target": [ 0, 0, 0 ], "panicDistance": 10 }, { "type": "FollowPathBehavior", "active": true, "weight": 1, "path": { "type": "Path", "loop": false, "_waypoints": [], "_index": 0 }, "nextWaypointDistance": 1 }, { "type": "SeekBehavior", "active": true, "weight": 1, "target": [ 0, 0, 0 ] }, { "type": "SeparationBehavior", "active": true, "weight": 1 }, { "type": "WanderBehavior", "active": true, "weight": 1, "radius": 1, "distance": 5, "jitter": 5, "_targetLocal": [ 0.9171491244303018, 0, 1.7773118700882888 ] }, { "type": "CustomSteeringBehavior1", "active": true, "weight": 1, "order": 0 } ] },
	Smoother: { "type": "Smoother", "count": 10, "_history": [[ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ]], "_slot": 0 },
	Path: { "type": "Path", "loop": false, "_waypoints": [[ 0, 0, 0 ]], "_index": 0 }

};
