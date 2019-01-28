/**
* @author {@link https://github.com/Mugen87|Mugen87}
*/
module.exports = {
	MemoryRecord: { "type": "MemoryRecord", "entity": "4C06581E-448A-4557-835E-7A9D2CE20D30", "timeLastSensed": - 1, "lastSensedPosition": [ 0, 0, 0 ], "visible": false },
	MemorySystem: { "type": "MemorySystem", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "records": [ { "type": "MemoryRecord", "entity": "52A33A16-6843-4C98-9A8E-9FCEA255A481", "timeLastSensed": - 1, "lastSensedPosition": [ 0, 0, 0 ], "visible": false } ], "memorySpan": 1 },
	Obstacle: { "type": "Obstacle", "uuid": "4C06581E-448A-4557-835E-7A9D2CE20D30", "name": "", "active": true, "children": [], "parent": null, "neighbors": [], "neighborhoodRadius": 1, "updateNeighborhood": false, "position": [ 0, 0, 0 ], "rotation": [ 0, 0, 0, 1 ], "scale": [ 1, 1, 1 ], "forward": [ 0, 0, 1 ], "up": [ 0, 1, 0 ], "boundingRadius": 0, "maxTurnRate": 3.141592653589793, "matrix": [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ], "worldMatrix": [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ], "_cache": { "position": [ 0, 0, 0 ], "rotation": [ 0, 0, 0, 1 ], "scale": [ 0, 0, 0 ] }, "_started": false, "geometry": { "type": "MeshGeometry", "indices": { "type": null, "data": null }, "vertices": [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ], "backfaceCulling": true, "aabb": { "type": "AABB", "min": [ 0, 0, 0 ], "max": [ 1, 0, 1 ] }, "boundingSphere": { "type": "BoundingSphere", "center": [ 0.5, 0, 0.5 ], "radius": 0.7071067811865476 } } },
	Vision: { "type": "Vision", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "fieldOfView": 0.7853981633974483, "range": "3", "obstacles": [ "4C06581E-448A-4557-835E-7A9D2CE20D31" ] }
};
