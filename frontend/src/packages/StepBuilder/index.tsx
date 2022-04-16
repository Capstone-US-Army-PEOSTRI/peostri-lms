import { Box, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import React, { MouseEventHandler, useEffect } from "react";
import { useState } from "react";
import { DragDropContext, Droppable, OnDragEndResponder } from "react-beautiful-dnd";
import { useFormContext } from "react-hook-form";
import AddNewButton from "./AddNewButton";
import AddStepButton from "./AddStepButton";
import RemoveStepButton from "./RemoveStepButton";
import StepMover from "./StepMover";

const PREFIX = 'StepBuilder';

const classes = {
    root: `${PREFIX}-root`,
    subRoot: `${PREFIX}-subRoot`,
    droppable: `${PREFIX}-droppable`,
    toolbar: `${PREFIX}-toolbar`,
    orderTitle: `${PREFIX}-orderTitle`,
    sideToolbar: `${PREFIX}-sideToolbar`,
    stepWrapper: `${PREFIX}-stepWrapper`,
    moduleDropper: `${PREFIX}-moduleDropper`
};

const Root = styled('div')(({ theme }) => ({
    width: '100%',

    [`& .${classes.root}`]: {
        marginTop: '1rem'
    },

    [`& .${classes.subRoot}`]: {
        flex: 1,
        '&:first-of-type': {
            borderTopLeftRadius: 5,
        },
        '&:last-child': {
            borderTopRightRadius: 5,
        },
        border: '1px solid ' + theme.palette.borderColor?.main,
        overflow: 'hidden'
    },

    [`& .${classes.droppable}`]: {
        flex: 1,
        display: 'flex',
        borderRadius: 5,
        padding: 5,
        height: '100%',
        minHeight: '50px',
        width: '100%',
        background: '#f5f5f5',
        transition: 'all .3s ease',
        alignItems: 'center',
        '&.isDraggingOver': {
            backgroundColor: '#e0e0e3',
            transition: 'all .3s ease',
        },
    },

    [`& .${classes.toolbar}`]: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
        backgroundColor: '#f5f5f5'
    },

    [`& .${classes.orderTitle}`]: {
        lineHeight: '1',
        color: theme.palette.text.primary,
        width: 'fit-content'
    },

    [`& .${classes.sideToolbar}`]: {
        width: '25%'
    },

    [`& .${classes.stepWrapper}`]: {
        '&:not(:last-child)': {
            borderBottom: '1px solid ' + theme.palette.borderColor?.main
        }
    },

    [`& .${classes.moduleDropper}`]: {

    }
}));

export type StepBuilderProps = {
    title: string,
    help: string,
    children: JSX.Element | JSX.Element[],
    save?: string,
    changeOnAction?: boolean,
    updateForm?: Function,
    createLabel?: string,
    createAction?: MouseEventHandler<Element>,
    defaultValue?: any,
    renderData?: any,
    changeStep: Function,
    changeIndex: Function,
    updateComponent?: Function,
    emptyText: string,
    actions?: JSX.Element[]
}

const StepBuilder = (props: StepBuilderProps) => {
    const { title, help, save, children, changeOnAction, updateForm, createLabel, createAction, defaultValue, renderData, changeStep, changeIndex, updateComponent, emptyText, actions } = props;

    const { setValue } = useFormContext();

    const [canAddSteps, setCanAddSteps] = useState(false);

    useEffect(() => {
        if (Object.keys(renderData).length >= 1) {
            if (!canAddSteps) setCanAddSteps(true);
        } else {
            if (canAddSteps) setCanAddSteps(false);
        }
    });

    const changeForm = (newValue?: any) => {
        if (!changeOnAction) {
            if (!updateForm) return;
            updateForm(newValue);
            updateComponent?.();
            return;
        }

        setValue(save || "", newValue || renderData);
        updateComponent?.();
    }

    const addStep = () => {
        changeForm({
            ...renderData,
            ["key-" + Object.keys(renderData).length]: []
        });
        changeStep(Object.keys(renderData).length);
    }

    const removeStep = (key: string) => {
        let cacheSteps = renderData;

        if (cacheSteps[key].length > 0) {
            if (cacheSteps["key-" + (parseInt((key.split('-')[1])) - 1)]) {
                cacheSteps["key-" + (parseInt((key.split('-')[1])) - 1)].push(...cacheSteps[key]);
            } else {
                cacheSteps["key-" + (parseInt((key.split('-')[1])) + 1)].push(...cacheSteps[key]);
            }
        }

        for (let i = parseInt(key.split('-')[1]) + 1; i < Object.keys(renderData).length; i++) {
            cacheSteps["key-" + (i - 1)] = cacheSteps["key-" + i];
        }

        delete cacheSteps["key-" + (Object.keys(cacheSteps).length - 1).toString()];

        changeStep(Object.keys(cacheSteps).length - 1);

        changeForm({
            ...cacheSteps
        });
    }

    const alterStepLocation = (oldIndex: number | string, newIndex: number | string) => {
        if (newIndex >= Object.keys(renderData).length || oldIndex < 0) return;
        let oldValue = renderData["key-" + oldIndex];
        let newValue = renderData["key-" + newIndex];

        changeForm({
            ...renderData,
            ["key-" + oldIndex]: newValue,
            ["key-" + newIndex]: oldValue
        });
    }

    const switchCardList = (sourceID: string, sourceIndex: number, destinationID: string, destinationIndex: number) => {
        let cachedSteps = renderData;
        cachedSteps[destinationID].splice(destinationIndex, 0, cachedSteps[sourceID][sourceIndex]);
        cachedSteps[sourceID].splice(sourceIndex, 1);

        changeForm({
            ...cachedSteps
        });
    }

    const alterCardLocation = (sourceID: string, sourceIndex: number, destinationIndex: number) => {
        let cachedSteps = renderData;
        let oldValue = cachedSteps[sourceID][sourceIndex];
        let newValue = cachedSteps[sourceID][destinationIndex];

        cachedSteps[sourceID][sourceIndex] = newValue;
        cachedSteps[sourceID][destinationIndex] = oldValue;

        changeForm({
            ...cachedSteps
        });
    }

    const onDragEnd: OnDragEndResponder = async result => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (destination.droppableId === source.droppableId) {
            alterCardLocation(source.droppableId, source.index, destination.index);
            return;
        }

        if (destination.droppableId !== source.droppableId) {
            switchCardList(source.droppableId, source.index, destination.droppableId, destination.index);
            return;
        }
    }

    return (
        <Root>
            <DragDropContext onDragEnd={onDragEnd}>
                <Box display="flex" flexDirection="column" className={classes.root}>
                    <div className={classes.subRoot}>
                        <div className={classes.toolbar}>
                            <Box width="35%">
                                <Typography variant="h6" className={classes.orderTitle}>
                                    {title}
                                </Typography>
                            </Box>
                            <Typography align="center" variant="subtitle1">
                                {help}
                            </Typography>
                            <Box width="35%" display="flex" justifyContent="flex-end" gap={1}>
                                {
                                    actions?.map((element, i) => {
                                        return React.cloneElement(element, {
                                            key: i
                                        });
                                    })
                                }
                                <AddNewButton label={createLabel} onClick={createAction} />
                                <AddStepButton label="project.layout.add_step" onClick={addStep} disabled={!canAddSteps} />
                            </Box>
                        </div>

                        {(Object.keys(renderData).length >= 1) ?
                            Object.keys(renderData).sort((first, second) => {
                                return parseInt(first.split('-')[1]) - parseInt(second.split('-')[1])
                            }).map((stepKey, i) => (
                                <Box display="flex" alignItems="center" className={classes.stepWrapper} key={"stepbox" + stepKey}>
                                    <Box padding={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                        <Typography variant="subtitle1">
                                            {"Step " + (i + 1)}
                                        </Typography>
                                        <StepMover botEdge={parseInt(stepKey.split('-')[1]) === (Object.keys(renderData).length - 1)} topEdge={parseInt(stepKey.split('-')[1]) === 0} up={() => alterStepLocation(parseInt(stepKey.split('-')[1]), parseInt(stepKey.split('-')[1]) - 1)} down={() => alterStepLocation(parseInt(stepKey.split('-')[1]), parseInt(stepKey.split('-')[1]) + 1)} />
                                    </Box>
                                    <Droppable droppableId={stepKey} direction="horizontal">
                                        {(droppableProvided, snapshot) => (
                                            <div ref={droppableProvided.innerRef}
                                                {...droppableProvided.droppableProps}
                                                className={
                                                    classes.droppable + (snapshot.isDraggingOver ? ' isDraggingOver' : '')
                                                }
                                            >
                                                {(renderData[stepKey]) ? renderData[stepKey].map((module: any, index: number) => {
                                                    return React.Children.map(children, (child) => {
                                                        return React.cloneElement(child, {
                                                            steps: renderData,
                                                            info: module,
                                                            index: index,
                                                            stepKey: stepKey,
                                                            subSteps: renderData[stepKey][index].tasks
                                                        });
                                                    });
                                                }) : <></>}
                                            </div>
                                        )}
                                    </Droppable>

                                    <Box>
                                        <RemoveStepButton label="" onClick={() => removeStep(stepKey)} disabled={(Object.keys(renderData).length > 1) ? false : true} />
                                    </Box>
                                </Box>
                            )
                            ) : (
                                <>
                                    <Typography variant="subtitle1" align="center" style={{ margin: '1rem 0' }}>
                                        {emptyText}
                                    </Typography>
                                </>
                            )}
                    </div>
                </Box>
            </DragDropContext>
        </Root>
    );
}

export default StepBuilder;
