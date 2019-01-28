/**
 * @author robp94 / https://github.com/robp94
 */
module.exports = {
	Edge: { "type": "Edge", "from": - 1, "to": - 1, "cost": 0 },
	Node: { "type": "Node", "index": - 1 },
	Graph: { "type": "Graph", "digraph": true, "_edges": [ { "type": "Edge", "from": 0, "to": 1, "cost": 0 }, { "type": "Edge", "from": 1, "to": 0, "cost": 0 } ], "_nodes": [ { "type": "Node", "index": 0 }, { "type": "Node", "index": 1 } ] }
};
