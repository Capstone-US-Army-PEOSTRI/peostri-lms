/**
* @file Component used to render the avatar group images. This comonent utilizes the ListContext to get the data.
* @module AvatarGroupField
* @category AvatarGroupField
* @author Braden Cariaga
*/

import { AvatarGroup, Tooltip, Avatar } from "@mui/material";
import { LinearProgress, useListContext } from "react-admin";
import { IUser } from "src/util/types";

export type AvatarGroupFieldProps = {
    width?: number
    height?: number
    fontSize?: string
    max?: number
    color?: string
}

/**
 * Component used to render the avatar group images. This comonent utilizes the ListContext to get the data.
 * @param {AvatarGroupFieldProps} props - AvatarGroupFieldProps
 */
const AvatarGroupField = (props: AvatarGroupFieldProps) => {
    const {
        data
    } = useListContext();

    return (data) ? (
        <>
            <AvatarGroup max={props.max || 4} sx={{
                flexDirection: 'row'
            }}>
                {data?.map((user: IUser) => (
                    <Tooltip title={`${user.firstName} ${user.lastName}`} key={user.id}>
                        <Avatar alt={`${user.firstName} ${user.lastName}`} src={user.avatar} sx={{ 
                            width: props.width || 24, 
                            height: props.height || 24,
                            fontSize: props.fontSize || '18px',
                            bgColor: props.color || 'inherit'
                        }} />
                    </Tooltip>
                ))}
            </AvatarGroup>
        </>
    ) : <LinearProgress />
}

export default AvatarGroupField;