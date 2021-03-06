/**
* @file Template Module Form Step Tasks
* @module TemplateModuleFormStepTasks
* @category TemplateModulesPage
* @author Braden Cariaga
*/

import { FormGroupContextProvider } from "react-admin";
import { Step } from "src/components/FormStepper/Step";
import ModuleTemplateTaskFields from "src/components/ModuleTemplateTaskFields";
import TaskManager from "src/components/TaskManager";
import { useFormContext } from "react-hook-form";
import { ITaskTemplate } from "src/util/types";

export type ModuleTemplateTasksProps = {
    getSource: Function,
    calculateTTC?: Function,
    validator: string
}

const Tasks = (props: ModuleTemplateTasksProps) => {    
    const { getSource, calculateTTC, validator, ...rest } = props;

    const { setValue, getValues } = useFormContext();

    const recalculateTTC = () => {
        const tasks = getValues(getSource?.('tasks'));
        if (!tasks) return;

        let module_ttc = 0;
        for (let [, step] of Object.entries<ITaskTemplate[]>(tasks)) {
            let stepTTC: number = 0;
            for (let [, task] of Object.entries<ITaskTemplate>(step)) {
                if (parseInt(`${`${task.ttc}`}`) < stepTTC) continue;
                stepTTC = parseInt(`${`${task.ttc}`}`);
            }
            module_ttc += stepTTC;
        }

        if (module_ttc === getValues(getSource?.('ttc'))) return;

        setValue(getSource?.('ttc'), module_ttc);

        if (props.calculateTTC) props.calculateTTC()
    }

    return (
        <>
            <Step validator={props.validator} {...rest}>
                <FormGroupContextProvider name={props.validator}>    
                    <TaskManager source={getSource?.('tasks') || ""} fields={<ModuleTemplateTaskFields calculateTTC={recalculateTTC} />}/>
                </FormGroupContextProvider>
            </Step>
        </>
    )
}

export default Tasks;