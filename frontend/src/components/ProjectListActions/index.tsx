/**
* @file Project list actions component. This adds the create from template button.
* @module ProjectListActions
* @category ProjectListActions
* @author Braden Cariaga
*/

import { cloneElement, useMemo, FC, ReactElement } from 'react';
import PropTypes from 'prop-types';
import {
    sanitizeListRestProps,
    Identifier,
    SortPayload,
    Exporter,
    useListContext,
    useResourceContext,
    useResourceDefinition,
} from 'ra-core';
import { ToolbarProps } from '@mui/material';
import { CreateButton, ExportButton, TopToolbar } from 'react-admin';
import CreateProjectFromTemplate from '../CreateProjectFromTemplate';

/**
 * Action Toolbar for the List view
 *
 * Internal component. If you want to add or remove actions for a List view,
 * write your own ListActions Component. Then, in the <List> component,
 * use it in the `actions` prop to pass a custom component.
 *
 * @example
 *     import { cloneElement } from 'react';
 *     import Button from '@mui/material/Button';
 *     import { TopToolbar, List, CreateButton, ExportButton } from 'react-admin';
 *
 *     const PostListActions = ({ basePath, filters }) => (
 *         <TopToolbar>
 *             { cloneElement(filters, { context: 'button' }) }
 *             <CreateButton/>
 *             <ExportButton/>
 *             // Add your custom actions here //
 *             <Button onClick={customAction}>Custom Action</Button>
 *         </TopToolbar>
 *     );
 *
 *     export const PostList = (props) => (
 *         <List actions={<PostListActions />} {...props}>
 *             ...
 *         </List>
 *     );
 */
const ProjectListActions: FC<ListActionsProps> = props => {
    const { className, exporter, filters, ...rest } = props;
    const {
        sort,
        displayedFilters,
        filterValues,
        selectedIds,
        showFilter,
        total,
    } = useListContext(props);
    const resource = useResourceContext(rest);
    const { hasCreate } = useResourceDefinition(rest);
    return useMemo(
        () => (
            <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
                {filters &&
                    cloneElement(filters, {
                        resource,
                        showFilter,
                        displayedFilters,
                        filterValues,
                        context: 'button',
                    })
                }
                <CreateProjectFromTemplate variant="text" />
                {hasCreate && <CreateButton />}
                {exporter !== false && (
                    <ExportButton
                        disabled={total === 0}
                        resource={resource}
                        sort={sort}
                        filterValues={filterValues}
                    />
                )}
            </TopToolbar>
        ),
        [resource, displayedFilters, filterValues, selectedIds, filters, total] // eslint-disable-line react-hooks/exhaustive-deps
    );
};

ProjectListActions.propTypes = {
    basePath: PropTypes.string,
    className: PropTypes.string,
    currentSort: PropTypes.any,
    displayedFilters: PropTypes.object,
    exporter: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    filters: PropTypes.element,
    filterValues: PropTypes.object,
    hasCreate: PropTypes.bool,
    resource: PropTypes.string,
    onUnselectItems: PropTypes.func.isRequired,
    selectedIds: PropTypes.arrayOf(PropTypes.any),
    showFilter: PropTypes.func,
    total: PropTypes.number,
};

ProjectListActions.defaultProps = {
    selectedIds: [],
    onUnselectItems: () => null,
};

export interface ListActionsProps extends ToolbarProps {
    currentSort?: SortPayload;
    className?: string;
    resource?: string;
    filters?: ReactElement<any>;
    displayedFilters?: any;
    exporter?: Exporter | boolean;
    filterValues?: any;
    permanentFilter?: any;
    hasCreate?: boolean;
    basePath?: string;
    selectedIds?: Identifier[];
    onUnselectItems?: () => void;
    showFilter?: (filterName: string, defaultValue: any) => void;
    total?: number;
}

export default ProjectListActions;