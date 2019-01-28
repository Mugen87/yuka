/**
 * @author robp94 / https://github.com/robp94
 */
module.exports = {
	RectangularTriggerRegion: { "type": "RectangularTriggerRegion", "_aabb": { "type": "AABB", "min": [ 0, 0, 0 ], "max": [ 0, 0, 0 ] } },
	SphericalTriggerRegion: { "type": "SphericalTriggerRegion", "_boundingSphere": { "type": "BoundingSphere", "center": [ 0, 0, 0 ], "radius": 0 } },
	TriggerRegion: { "type": "TriggerRegion" },
	TriggerTR: { "type": "Trigger", "active": true, "region": { "type": "TriggerRegion" } },
	TriggerRR: { "type": "Trigger", "active": true, "region": { "type": "RectangularTriggerRegion", "_aabb": { "type": "AABB", "min": [ 0, 0, 0 ], "max": [ 0, 0, 0 ] } } },
	TriggerSR: { "type": "Trigger", "active": true, "region": { "type": "SphericalTriggerRegion", "_boundingSphere": { "type": "BoundingSphere", "center": [ 0, 0, 0 ], "radius": 0 } } },
	TriggerCR: { "type": "Trigger", "active": true, "region": { "type": "CustomTriggerRegion" } }
};
