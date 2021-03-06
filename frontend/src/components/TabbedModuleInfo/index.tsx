/**
* @file Main tab component for the horizontal tabber on the modules show page.
* @module TabbedModuleInfo
* @category TabbedModuleInfo
* @author Braden Cariaga
*/

import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import { useState } from "react";
import { IModule } from "src/util/types";
import { useShowContext } from 'react-admin';
import TabbedTaskList from "../TabbedTaskList";
import DocumentTabbedList from "../DocumentTabbedList";

const hasFiles = (record: IModule) => {
    return (record && record?.files && (record?.files?.latest || record?.files?.old?.length > 0 || record?.files?.reviews?.length > 0 || record?.files?.oldReviews?.length > 0))
}

type ModuleTabs = "DOCS" | "TASKS" | "LOGS";

export type TabbedModuleInfoProps = {

}

const TabbedModuleInfo = (props: TabbedModuleInfoProps) => {
    const {
        record
    } = useShowContext();

    const [tab, setTab] = useState<ModuleTabs>("TASKS");
    const handleChange = (event: React.SyntheticEvent, newValue: ModuleTabs) => {
        setTab(newValue);
    };

    return (
        <>
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', margin: '-10px 0 0 0' }}>
                    <TabList onChange={handleChange} aria-label="Project-Tabs" variant="fullWidth">
                        <Tab label="Tasks" value="TASKS" />
                        {(hasFiles(record)) ? <Tab label="Documents" value="DOCS" /> : null }
                        {/*<Tab label="Logs" value="LOGS" />*/}
                    </TabList>
                </Box>
                <TabPanel value="TASKS" sx={{
                    padding: '0'
                }}>
                    <TabbedTaskList />
                </TabPanel>
                {(hasFiles(record)) ? (
                    <TabPanel value="DOCS" sx={{
                        padding: '0'
                    }}>
                        <DocumentTabbedList />
                    </TabPanel>
                ) : null }
                {/*<TabPanel value="LOGS" sx={{
                    padding: '0'
                }}>

                </TabPanel>*/}
            </TabContext>
        </>
    )
}

export default TabbedModuleInfo;