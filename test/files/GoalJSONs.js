/**
* @author {@link https://github.com/Mugen87|Mugen87}
*/
module.exports = {
	GoalEvaluator: { "type": "GoalEvaluator", "characterBias": 0.5 },
	Goal: { "type": "Goal", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "status": "completed" },
	CompositeGoal: { "type": "CompositeGoal", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "status": "inactive", "subgoals": [ { "type": "CustomGoalCompleted", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "status": "completed" } ] },
	Think: { "type": "Think", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "status": "inactive", "subgoals": [ { "type": "CustomCompositeGoal", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "status": "inactive", "subgoals": [ { "type": "CustomGoal", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "status": "inactive" } ] } ], "evaluators": [ { "type": "GoalEvaluator1", "characterBias": 0.5 } ] },
	ThinkMissingTypes: { "type": "Think", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "status": "inactive", "subgoals": [ { "type": "CustomGoal", "owner": "4C06581E-448A-4557-835E-7A9D2CE20D30", "status": "inactive" } ], "evaluators": [ { "type": "CustomGoalEvaluator", "characterBias": 0.5 } ] },
};
