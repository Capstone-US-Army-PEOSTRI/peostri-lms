/**
* @file Review task action renders the button and dialogs for an review task.
* @module TaskActionReview
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { useRefresh, useUpdate, FileField, FileInput, useRecordContext, useNotify, useDataProvider, useShowContext } from "react-admin";
import { Button, Typography, Box, Tooltip } from "@mui/material";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler, useEffect, useState } from "react";
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { red, green } from "@mui/material/colors";
import DocumentViewer from "../DocumentViewer";

export type TaskActionApproveProps = {
    id: string
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
    record: any
}

/**
 * Review task action renders the button and dialogs for an review task.
 * @param {TaskActionApproveProps} props - TaskActionApproveProps
 */
const TaskActionApprove = (props: TaskActionApproveProps) => {
    const [update] = useUpdate();
    const refresh = useRefresh();
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const task = useRecordContext(props);
    let { record } = useShowContext();

    const [docOpen, setDocOpen] = useState(false);

    const [files, setFiles] = useState(record?.files);

    useEffect(() => {
        if (!files && record.modules) {
            dataProvider.getOne('modules', { id: props.record.module })
            .then(({data}) => setFiles(data.files));
        }
    }, [record, task]);

    if (!record || !task) return null;

    /**
     * The handleClose function is a function that is called when the user clicks the close button. It
     * calls the close function that was passed in as a prop.
     */
    const handleClose = () => {
        setDocOpen(false)
        props.close()
    }

    const handleDeny = (data: any) => {
        update(`proceeding/tasks/deny`, { id: props.id, data, previousData: {} }, {
            onSuccess: (data) => {
                refresh();
                notify('Submitted revision document.');
            },
            onError: (error: any) => {
                notify(`Document upload error: ${error.message}`, { type: 'warning' });
            },
        }).finally(() => props.close()); 
    }

    const handleApprove = () => {
        update(`proceeding/tasks/approve`, { id: props.id, data: {}, previousData: {} }, {
            onSuccess: (data) => {
                refresh();
                notify('Approved document.');
            },
            onError: (error: any) => {
                notify(`Document upload error: ${error.message}`, { type: 'warning' });
            },
        }).finally(() => props.close()); 
    }

    return (
        <> 
            <Box display="flex" gap="8px">
                <Tooltip title={"Reject"}>
                    <Button variant="outlined" onClick={props.setOpen} color="error" size="small" sx={{ minWidth: '0', padding: '8px', fontSize: '14px' }}>
                        <ThumbDownIcon fontSize="inherit" sx={{ color: red[500] }} />
                    </Button>
                </Tooltip>
                <Tooltip title={"Approve"}>
                    <Button variant="outlined" color="success" size="small" sx={{ minWidth: '0', padding: '8px', fontSize: '14px' }} onClick={handleApprove}>
                        <ThumbUpIcon fontSize="inherit" sx={{ color: green[500] }} />
                    </Button>
                </Tooltip>
                <Button variant="outlined" onClick={() => setDocOpen(true)}>
                    View
                </Button>
                <DocumentViewer 
                    open={docOpen} 
                    handleClose={() => setDocOpen(false)} 
                    ariaLabel={`document-reviewer-${files?.latest?.title}`} 
                    label={files?.latest?.title} 
                    src={files?.latest?.src} 
                    maxWidth="md" 
                    actions={
                        [
                            <Tooltip title={"Reject"}>
                                <Button variant="outlined" onClick={props.setOpen} color="error" size="medium" sx={{ minWidth: '0', padding: '8px', fontSize: '18px' }} >
                                    <ThumbDownIcon fontSize="inherit" sx={{ color: red[500] }} />
                                    <Typography variant="button" ml="8px">Reject</Typography>
                                </Button>
                            </Tooltip>,
                            <Tooltip title={"Approve"}>
                                <Button variant="outlined" onClick={() => {
                                    handleApprove();
                                    props.close();
                                }} color="success" size="medium" sx={{ minWidth: '0', padding: '8px', fontSize: '18px' }} >
                                    <ThumbUpIcon fontSize="inherit" sx={{ color: green[500] }} />
                                    <Typography variant="button" ml="8px">Accept</Typography>
                                </Button>
                            </Tooltip>
                        ]
                    }       
                />
            </Box>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Upload Revision Comments" open={props.open} handleSubmit={handleDeny} handleClose={handleClose} submitText={"Reject"} submitColor="error" submitVariant="outlined" submitIcon={<ThumbDownIcon />} allowEmptySubmit>
                <Typography variant="subtitle1" mb="-.75rem">If you have comments, please upload them:</Typography>
                <FileInput source="file" accept="application/pdf" fullWidth label=" " labelSingle="project.fields.waiver_file" helperText=" " sx={{
                    '& .RaFileInput-dropZone': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        border: '2px solid rgba(0, 0, 0, 0.04)',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: '#4f3cc9',
                            transition: 'all 0.2s ease',
                        }
                    }
                }}>
                    <FileField source="src" title="title" download={true} />
                </FileInput>
            </TaskActionDialog>
        </>
    );
}

export default TaskActionApprove;

