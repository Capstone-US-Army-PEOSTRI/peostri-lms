/**
* @file Dashboard Team Tasks Widgets
* @module TeamTasksWidget
* @category Dashboard
* @author Braden Cariaga
*/

import TaskList from "./TaskList";

const TeamTasks = () => {
    return (
        <TaskList resource="tasks/team" filter={{ status: "IN_PROGRESS" }} title="dashboard.widget.tasks.team_title" />
    )
}

export default TeamTasks;