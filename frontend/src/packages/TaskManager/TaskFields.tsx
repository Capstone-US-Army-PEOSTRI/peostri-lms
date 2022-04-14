import { Grid } from "@mui/material";
import { styled } from '@mui/material/styles';
import get from "lodash.get";
import { useEffect } from "react";
import { maxLength, minLength, NumberInput, ReferenceArrayInput, ReferenceInput, required, SelectInput, TextInput, useTranslate } from "react-admin";
import { useForm } from "react-final-form";
import AutoAssignArrayInput from "./AutoAssignArrayInput";
import { IDField } from "src/components/misc";

const PREFIX = 'TaskFields';

const classes = {
    taskForm: `${PREFIX}-taskForm`,
    taskTitle: `${PREFIX}-taskTitle`,
    taskFieldWrapper: `${PREFIX}-taskFieldWrapper`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.taskForm}`]: {
        marginTop: '1.75rem'
    },

    [`& .${classes.taskTitle}`]: {
        position: 'absolute',
        width: 'auto',
        display: 'inline-block',
        top: '1rem',
        left: '1.5rem',
        fontSize: '1.4rem',
        borderBottom: '2px solid ' + theme.palette.primary.main,
        paddingBottom: '.25rem',
        lineHeight: '1',
        color: theme.palette.text.primary,
        whiteSpace: 'nowrap'
    },

    [`& .${classes.taskFieldWrapper}`]: {
        alignItems: 'flex-start',
        marginTop: '0'
    }
}));

export type TaskFieldsProps = {
    getSource: Function,
    defaultValues?: any,
    calculateTTC?: Function
}

const TaskFields = (props: TaskFieldsProps) => {
    const { getSource } = props;

    const translate = useTranslate();
    const validateTitle = [required(), minLength(2), maxLength(150)];
    const form = useForm();

    useEffect(() => props.calculateTTC?.(), [get(form.getState().values, getSource?.('ttc'))]);

    return (
        (<Root>
            <Grid container spacing={4} className={classes.taskFieldWrapper}>
                <IDField source={getSource?.('id') || ""} id={props.defaultValues?.id} />
                <Grid item xs={5}>
                    <TextInput
                        source={getSource?.('title') || ""}
                        label="project.fields.task_title"
                        fullWidth
                        helperText=" "
                        validate={validateTitle}
                    />
                </Grid>
                <Grid item xs={4}>
                    <SelectInput
                        source={getSource?.('type') || ""}
                        choices={[
                            { id: 'DOCUMENT_UPLOAD', name: translate('tasks.types.document_upload') },
                            { id: 'DOCUMENT_REVIEW', name: translate('tasks.types.document_review') },
                            { id: 'DOCUMENT_APPROVE', name: translate('tasks.types.document_approve') },
                            //{ id: 'MODULE_WAIVER', name: translate('tasks.types.module_waiver'), not_available: true },                                                                                               
                            { id: 'MODULE_WAIVER_APPROVAL', name: translate('tasks.types.module_waiver_approval'), not_available: false },
                        ]}
                        optionText={choice => `${choice.name}`}
                        optionValue="id"
                        label="project.fields.task_type"
                        fullWidth
                        helperText=" "
                        validate={[required()]}
                        disableValue="not_available"
                    />
                </Grid>
                <Grid item xs={3}>
                    <SelectInput
                        source={getSource?.('status') || ""}
                        choices={[
                            { id: 'AWAITING', name: 'AWAITING' },
                            { id: 'IN_PROGRESS', name: 'IN PROGRESS' },
                            { id: 'COMPLETED', name: 'COMPLETED' },
                            { id: 'ARCHIVED', name: 'ARCHIVED' }
                        ]}
                        optionText={choice => `${choice.name}`}
                        optionValue="id"
                        disabled={false}
                        defaultValue="AWAITING"
                        label="project.fields.task_status"
                        fullWidth
                        helperText=" "
                    />
                </Grid>

                <Grid item xs={6} style={{ marginTop: '-32px' }}>
                    <ReferenceInput
                        label="project.fields.rank"
                        reference="admin/ranks"
                        source={getSource?.('rank') || ""}
                    >
                        <SelectInput
                            optionText={choice => `${choice.name}`}
                            optionValue="id"
                            helperText=" "
                            fullWidth
                        />
                    </ReferenceInput>
                </Grid>

                <Grid item xs={6} style={{ marginTop: '-32px' }}>
                    <NumberInput
                        source={getSource?.('ttc') || ""}
                        label="template.module.fields.ttc"
                        fullWidth
                        helperText=" "
                        validate={[required()]}
                    />
                </Grid>

                <Grid item xs={12} style={{ marginTop: '-32px' }}>
                    <ReferenceArrayInput
                        label="project.fields.member"
                        reference="users"
                        source={getSource?.('users') || ""}
                    >
                        <AutoAssignArrayInput source={getSource?.()} />
                    </ReferenceArrayInput>
                </Grid>
            </Grid>
        </Root>)
    );
}

export default TaskFields;