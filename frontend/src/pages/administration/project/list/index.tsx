import { Datagrid, DateField, List, ListProps, TextField } from 'react-admin';
import { ProjectEmptyList, ProjectListActions } from 'src/components/project';
import rowStyle from './rowStyle';
import { dateOptions } from 'src/util/dateFormatter';

const AdminProjectList = (props: ListProps) => {

    return (
        <>
            <List {...props}
                perPage={25}
                empty={<ProjectEmptyList />}
                actions={<ProjectListActions />}
            >
                <Datagrid
                    sx={{
                        [`& .RaDatagrid-headerRow`]: {
                            borderLeftColor: 'transparent',
                            borderLeftWidth: 5,
                            borderLeftStyle: 'solid',
                        },
                        [`& .RaDatagrid-headerCell`]: {
                            padding: '6px 8px 6px 8px',
                        },
                        [`& .RaDatagrid-rowCell`]: {
                            padding: '6px 8px 6px 8px',
                        }
                    }}
                    // @ts-ignore
                    rowStyle={rowStyle}
                    rowClick="edit"
                >
                    {/*<TextField source="id" /> // TODO: Temporarily removing ID due to illegible ID's */}
                    <TextField source="title" />
                    <DateField source="createdAt" locales="en-GB" showTime options={dateOptions} />
                    <DateField source="updatedAt" locales="en-GB" showTime options={dateOptions} />
                    <DateField source="start" locales="en-GB" />
                    <DateField source="suspense" locales="en-GB" />
                    <TextField source="status" />
                </Datagrid>
            </List>
        </>
    );
}

export default AdminProjectList;
