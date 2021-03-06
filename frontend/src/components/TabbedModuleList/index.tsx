/**
* @file List of modules used inside a tabbed component to show the modules in a list.
* @module TabbedModuleList
* @category TabbedModuleList
* @author Braden Cariaga
*/

import { Datagrid, DateField, TextField, useShowContext } from "react-admin";
import { useState } from "react";
import { IModuleStep } from "src/util/types";
import StepTabber from "src/components/StepTabber";
import statusRowStyle from "src/util/statusRowStyle";

const TabbedModuleList = () => {
    const {
        record
    } = useShowContext();

    const currentModules = (record.currentStep !== "-1") ? { [`key-${record.currentStep}`]: record.modules[`key-${record.currentStep}`] } : {} as IModuleStep
    const upcomingModules = (() => {
        let steps = {} as IModuleStep;
        if (record.currentStep === "-1") return steps;

        for (let i = record.currentStep + 1; i < Object.keys(record.modules).length; i++) {
            steps[`key-${i}`] = record.modules[`key-${i}`];
        }
        return steps;
    })()
    const completedModules = (() => {
        let steps = {} as IModuleStep;
        let starter = record.currentStep;
        
        if (starter === '-1') starter = Object.keys(record.modules).length

        for (let i = starter - 1; i >= 0; i--) {
            steps[`key-${i}`] = record.modules[`key-${i}`];
        }
        return steps;
    })()

    const [tab, setTab] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const tabOptions = [];
    if (currentModules && Object.keys(currentModules).length > 0) tabOptions.push({ name: 'Current', content: currentModules });
    if (upcomingModules && Object.keys(upcomingModules).length > 0) tabOptions.push({ name: 'Upcoming', content: upcomingModules });
    if (completedModules && Object.keys(completedModules).length > 0)  tabOptions.push({ name: 'Completed', content: completedModules });

    return (
        <>
            <StepTabber tab={tab} tabOptions={tabOptions} handleChange={handleChange} reference="modules" >
                <Datagrid
                    bulkActionButtons={false}
                    rowClick="show"
                    rowStyle={statusRowStyle}
                >
                    <TextField source="title" />
                    <DateField source="suspense" locales="en-GB" />
                    <TextField source="status" />
                    <TextField source="currentStep" />
                </Datagrid>
            </StepTabber>
        </>
    )
}

export default TabbedModuleList;