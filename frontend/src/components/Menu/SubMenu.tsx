/**
* @file Left sidebar navigation SubMenu Component - allows for the dropdown.
* @module SubMenu
* @category Menu
* @author Braden Cariaga
*/

import { ReactElement, ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import {
    List,
    MenuItem,
    ListItemIcon,
    Typography,
    Collapse,
    Tooltip,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useTranslate, useSidebarState } from 'react-admin';

const PREFIX = 'SubMenu';

const classes = {
    icon: `${PREFIX}-icon`,
    sidebarIsOpen: `${PREFIX}-sidebarIsOpen`,
    sidebarIsClosed: `${PREFIX}-sidebarIsClosed`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.icon}`]: { minWidth: theme.spacing(5) },

    [`& .${classes.sidebarIsOpen}`]: {
        '& a': {
            transition: 'padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
            paddingLeft: theme.spacing(4),
        },
    },

    [`& .${classes.sidebarIsClosed}`]: {
        '& a': {
            transition: 'padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
            paddingLeft: theme.spacing(2),
        },
    }
}));

export type SubMenuProps = {
    dense: boolean;
    handleToggle: () => void;
    icon: ReactElement;
    isOpen: boolean;
    name: string;
    children: ReactNode;
}

/**
 * Left sidebar navigation SubMenu Component - allows for the dropdown.
 * @param {SubMenuProps} props - SubMenuProps
 * @returns 
 */
const SubMenu = (props: SubMenuProps) => {
    const { handleToggle, isOpen, name, icon, children, dense } = props;
    const translate = useTranslate();

    const [sidebarIsOpen] = useSidebarState();

    /* Creating a menu item that is clickable and will toggle the submenu open or closed. */
    const header = (
        <MenuItem dense={dense} onClick={handleToggle}>
            <ListItemIcon className={classes.icon}>
                {isOpen ? <ExpandMore /> : icon}
            </ListItemIcon>
            <Typography variant="inherit" color="textSecondary">
                {translate(name)}
            </Typography>
        </MenuItem>
    );

    return (
        <Root>
            {sidebarIsOpen || isOpen ? (
                header
            ) : (
                <Tooltip title={translate(name)} placement="right">
                    {header}
                </Tooltip>
            )}
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List
                    dense={dense}
                    component="div"
                    disablePadding
                    className={
                        sidebarIsOpen
                            ? classes.sidebarIsOpen
                            : classes.sidebarIsClosed
                    }
                >
                    {children}
                </List>
            </Collapse>
        </Root>
    );
};

export default SubMenu;
