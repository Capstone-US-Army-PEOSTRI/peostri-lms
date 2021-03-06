/**
* @file Dashboard Empty Projects Widgets
* @module EmptyProjectsWidget
* @category Dashboard
* @author Braden Cariaga
*/

import { Box, styled, Typography } from "@mui/material";
import { useTranslate } from "react-admin";
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

const classes = {
    fontSizeLarge: `TaskEmpty-fontSizeLarge`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.fontSizeLarge}`]: {
        fontSize: '48px'
    }
}));

const ProjectEmpty = () => {
    const translate = useTranslate();
    return (
        <Root>
            <Box minWidth='calc(300px - 2rem)' display="flex" justifyContent="center" alignItems="center" padding="1rem 1rem" flexDirection="column" >
                <NotificationsOffIcon fontSize="large" color='primary' classes={classes} />
                <Typography variant="subtitle1" >
                    {translate('notification.empty')}
                </Typography>
            </Box>
        </Root>
    );
}

export default ProjectEmpty;