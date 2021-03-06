/**
* @file Dashboard Notifications Widget
* @module MyNotifications
* @category Dashboard
* @author Braden Cariaga
*/

import CardWithIcon from "../base/CardWithIcon"
import { INotification } from "src/util/types";
import { Box, Button, Divider, List, ListItem, ListItemText } from "@mui/material";
import { Identifier, LinearProgress, useCreatePath, useGetList, useTranslate, useUpdate } from "react-admin";
import { Link } from "react-router-dom";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationListItem from "./NotificationListItem";

export type MyNotificationsProps = {
    title?: string
}

const MyNotifications = (props: MyNotificationsProps) => {
    const translate = useTranslate();
    const createPath = useCreatePath();
    const [update] = useUpdate();
    
    const { data: notifications, total, isLoading, isError } = useGetList<INotification>('notifications', {
        filter: { read: false },
        sort: { field: 'read', order: 'ASC' },
        pagination: { page: 1, perPage: 8 },
    });

    const display = isLoading ? 'none' : 'block';

    const markRead = (id: Identifier, read: boolean) => {
        if (read) return;

        update('notifications/read', { id: id, data: {}, previousData: { id: id } })
        .then(() => {
            return;
        })
        .catch(error => {
            return;
        })
    }

    if (isError) return null;
    
    return (
        <CardWithIcon icon={NotificationsNoneIcon} to={createPath({ resource: `notifications`, type: 'list' })} replace={true} title={props.title || "dashboard.widget.my_notifications.title"} subtitle={(isLoading) ? <Box display="flex" justifyContent="center"><LinearProgress /></Box> : (total || "0")}>
            {(notifications && notifications.length > 0) ? (
                <>
                    <List sx={{ display }}>
                        {notifications?.map((record: INotification) => (
                            <ListItem
                                key={record.id}
                                button
                                component={Link}
                                to={createPath({ resource: `${record.sender.resource}`, id: record.sender.id, type: 'show' })}
                                replace={true}
                                onClick={() => markRead(record.id, record.read)}
                                alignItems="flex-start"
                                sx={{
                                    transition: 'all .2s',
                                    color: (theme) => theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette?.borderColor?.main,
                                        transition: 'all .2s'
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={<NotificationListItem record={record} />}
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
                    <Divider />
                    <Button
                        sx={{ borderRadius: 0 }}
                        component={Link}
                        to={createPath({ resource: `notifications`, type: 'list' })}
                        size="small"
                        color="primary"
                        replace={true}
                    >
                        <Box p={1} sx={{ color: 'primary.main' }}>
                            {translate('dashboard.widget.my_notifications.all')}
                        </Box>
                    </Button>
                </>
            ) : null}
        </CardWithIcon>
    )
}

export default MyNotifications;