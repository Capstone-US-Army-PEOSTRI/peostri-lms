/**
* @file Empty component to use when there are not projects to display.
* @module ProjectEmptyList
* @category ProjectEmptyList
* @author Braden Cariaga
*/

import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Inbox from '@mui/icons-material/Inbox';
import {
    useTranslate,
    useResourceContext,
    useGetResourceLabel,
    CreateButton,
    useResourceDefinition
} from 'react-admin';
import CreateProjectFromTemplate from '../CreateProjectFromTemplate';

const PREFIX = 'RaEmpty';

const classes = {
    message: `${PREFIX}-message`,
    icon: `${PREFIX}-icon`,
    toolbar: `${PREFIX}-toolbar`
};

const Root = styled('div')(({ theme }) => ({
    margin: 'auto',
    [`& .${classes.message}`]: {
        textAlign: 'center',
        opacity: theme.palette.mode === 'light' ? 0.5 : 0.8,
        margin: '0 1em',
        color:
            theme.palette.mode === 'light'
                ? 'inherit'
                : theme.palette.text.primary,
    },

    [`& .${classes.icon}`]: {
        width: '9em',
        height: '9em',
    },

    [`& .${classes.toolbar}`]: {
        textAlign: 'center',
        marginTop: '2em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1em',
        width: '100%'
    }
}));

const ProjectEmptyList = (props: EmptyProps) => {
    const { hasCreate } = useResourceDefinition();
    const resource = useResourceContext(props);

    const translate = useTranslate();

    const getResourceLabel = useGetResourceLabel();
    const resourceName = translate(`resources.${resource}.forcedCaseName`, {
        smart_count: 0,
        _: getResourceLabel(resource, 0),
    });

    const emptyMessage = translate('ra.page.empty', { name: resourceName });
    const inviteMessage = translate('ra.page.invite');

    return (
        <Root>
            <div className={classes.message}>
                <Inbox className={classes.icon} />
                <Typography variant="h4" paragraph>
                    {translate(`resources.${resource}.empty`, {
                        _: emptyMessage,
                    })}
                </Typography>
                {hasCreate && (
                    <Typography variant="body1">
                        {translate(`resources.${resource}.invite`, {
                            _: inviteMessage,
                        })}
                    </Typography>
                )}
            </div>
            {hasCreate && (
                <div className={classes.toolbar}>
                    <CreateButton variant="contained" />
                    <CreateProjectFromTemplate />
                </div>
            )}
        </Root>
    );
};

export type EmptyProps = {

    resource?: string;
}

export default ProjectEmptyList;