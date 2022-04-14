import { AutocompleteArrayInput, ReferenceArrayInput } from "react-admin";
import { useWatch } from "react-hook-form";

export type UserInputProps = {

}

const UserInput = (props: UserInputProps) => {
    const team = useWatch({ name: "team" })

    return (
        <>
            <ReferenceArrayInput
                label="project.fields.member"
                reference="admin/users"
                source="users"
                filter={(team) ? { teams: team } : undefined}
            >
                <AutocompleteArrayInput
                    optionText={choice => `${choice.firstName} ${choice.lastName}`}
                    optionValue="id"
                    helperText=" "
                    fullWidth
                />
            </ReferenceArrayInput>
        </>
    )
}

export default UserInput