import CardWithIcon from "../base/CardWithIcon"
import { ITask } from "src/util/types";
import { Box, Button, Divider, List, ListItem, ListItemText } from "@mui/material";
import { LinearProgress, SortPayload, useCreatePath, useGetList, useTranslate } from "react-admin";
import { Link } from "react-router-dom";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TaskListItem from "./TaskListItem";
import TaskEmpty from "./TaskEmpty";
import { AnyNsRecord } from "dns";

export type TaskListProps = {
    title?: string
    resource?: string
    filter?: any
    sort?: SortPayload
    showCount?: number
}

const TaskList = (props: TaskListProps) => {
    const translate = useTranslate();
    const createPath = useCreatePath();
    
    const { data: tasks, total, isLoading, isError } = useGetList<ITask>(props.resource || 'tasks', {
        filter: props.filter || {},
        sort: props.sort || { field: 'suspense', order: 'ASC' },
        pagination: { page: 1, perPage: props.showCount || 8 },
    });

    const display = isLoading ? 'none' : 'block';

    if (isError) return null;

    return (
        <CardWithIcon icon={TaskAltIcon} to={createPath({ resource: `tasks`, type: 'list' })} title={props.title || "dashboard.widget.tasks.my_title"} subtitle={total || 0}>
            {(tasks) ? (
                <List sx={{ display }}>
                    {tasks?.map((record: ITask) => (
                        <ListItem
                            key={record.id}
                            button
                            component={Link}
                            to={createPath({ resource: `tasks`, id: record.id, type: 'show' })}
                            replace={true}
                            alignItems="flex-start"
                        >
                            <ListItemText
                                primary={<TaskListItem record={record} />}
                                sx={{
                                    overflowY: 'hidden',
                                    height: 'auto',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    paddingRight: 0,
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                (isLoading) ? <Box display="flex" justifyContent="center"><LinearProgress /></Box> : <TaskEmpty />
            )}
            <Divider />
            <Button
                sx={{ borderRadius: 0 }}
                component={Link}
                to={createPath({ resource: props.resource || `tasks`, type: 'list' })}
                size="small"
                color="primary"
                replace={true}
                disabled={(!tasks) ? true : false}
            >
                <Box p={1} sx={{ color: 'primary.main' }}>
                    {translate('dashboard.widget.tasks.all')}
                </Box>
            </Button>
        </CardWithIcon>
    )
}

export default TaskList;