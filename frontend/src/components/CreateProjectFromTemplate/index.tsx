/**
* @file Main component for creating a project from a template.
* @module CreateProjectFromTemplate
* @category CreateProjectFromTemplate
* @author Braden Cariaga
*/

import { styled } from "@mui/material";
import { useState } from "react";
import { SimpleForm, useTranslate } from "react-admin";
import CreateProjectFromTemplateButton from "./CreateProjectFromTemplateButton";
import CreateProjectFromTemplateDialog from "./CreateProjectFromTemplateDialog";

export type CreateProjectFromTemplateProps = {
    variant?: 'contained' | 'outlined' | 'text'
}

const Root = styled('div')(({ theme }) => ({
    [`& form`]: {
        display: 'none',
        visibility: 'hidden'
    }
}));

/**
 * CreateProjectFromTemplate is a function that returns a CreateProjectFromTemplateButton component and a SimpleForm component that contains a CreateProjectFromTemplateDialog component.
 * @param {CreateProjectFromTemplateProps} props - CreateProjectFromTemplateProps
 */
const CreateProjectFromTemplate = (props: CreateProjectFromTemplateProps) => {
    const translate = useTranslate();
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <Root>
            <CreateProjectFromTemplateButton label="project.create.from_template" onClick={() => setDialogOpen(true)} variant={(props.variant) ? props.variant : undefined} />
            <SimpleForm 
                hidden={true}
                toolbar={<></>}
                mode="onBlur"
                warnWhenUnsavedChanges
            >
                <CreateProjectFromTemplateDialog ariaLabel={"project_template_selection"} label={translate("project.layout.select_template")} open={dialogOpen} setOpen={setDialogOpen} />
            </SimpleForm>
        </Root>
    )
}

export default CreateProjectFromTemplate;