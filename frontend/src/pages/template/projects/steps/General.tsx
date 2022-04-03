import { Box, Grid } from "@material-ui/core"
import { AutocompleteArrayInput, BooleanInput, DateInput, FormGroupContextProvider, maxLength, minLength, NumberInput, ReferenceArrayInput, required, SelectInput, TextInput, useTranslate } from "react-admin"
import { useForm } from "react-final-form";
import { SectionTitle } from "src/components/misc";
import IDField from "src/components/modules/IDField";
import { Step } from "src/components/FormStepper/Step"

type GeneralStepProps = {
    validator: string
    getSource?: Function
    initialValues?: any
}

const General = (props: GeneralStepProps) => {
    const { getSource, validator, initialValues, ...rest } = props;
    const validateTitle = [required(), minLength(2), maxLength(150)];

    return (
        <Step validator={props.validator} {...rest}>
            <FormGroupContextProvider name={props.validator}>
                <Box display="flex" width="100%" flexDirection="column" style={{
                    marginTop: '1rem'
                }}>
                    <SectionTitle label="template.project.layout.general" />
                    <Grid container spacing={4}>
                        <Grid item xs={5}>
                            <TextInput
                                source="title"
                                label="template.project.fields.title"
                                fullWidth
                                helperText=" "
                                validate={validateTitle}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <SelectInput
                                source="status"
                                choices={[
                                    { id: 'AWAITING', name: 'AWAITING' },
                                    { id: 'IN_PROGRESS', name: 'IN PROGRESS' },
                                    { id: 'COMPLETED', name: 'COMPLETED' },
                                    { id: 'WAIVED', name: 'WAIVED' },
                                    { id: 'ARCHIVED', name: 'ARCHIVED' }
                                ]}
                                optionText={choice => `${choice.name}`}
                                optionValue="id"
                                initialValue="AWAITING"
                                label="template.project.fields.status"
                                fullWidth
                                helperText=" "
                            />
                        </Grid>
                        
                        <Grid item xs={3}>
                            <NumberInput
                                source="ttc"
                                label="template.project.fields.ttc"
                                fullWidth
                                helperText="template.project.fields.ttc_help"
                                disabled
                            />
                        </Grid>
                    </Grid>
                </Box>
            </FormGroupContextProvider>
        </Step>
    )
}

export default General