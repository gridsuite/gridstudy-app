/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import { Checkbox, CircularProgress, Toolbar, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckboxList from '../../../utils/checkbox-list';
import IconButton from '@mui/material/IconButton';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useIsAnyNodeBuilding } from '../../../utils/is-any-node-building-hook';
import {
    addNotification,
    removeNotificationByNode,
    setModificationsInProgress,
} from '../../../../redux/actions';
import {
    EVENT_CRUD_FINISHED,
    EventCrudType,
} from 'components/network/constants.type';

import { Theme } from '@mui/material/styles';
import { ReduxState, StudyUpdated } from '../../../../redux/reducer.type';
import { UUID } from 'crypto';
import {
    Event,
    EventType,
} from '../../../dialogs/dynamicsimulation/event/types/event.type';
import {
    deleteDynamicSimulationEvents,
    fetchDynamicSimulationEvents,
    moveDynamicSimulationEvent,
} from '../../../../services/dynamic-simulation';
import { EventListItem } from './event-list-item';
import { DynamicSimulationEventDialog } from '../../../dialogs/dynamicsimulation/event/dynamic-simulation-event-dialog';
import { FetchStatus } from '../../../../services/utils';

const useStyles = makeStyles((theme: Theme) => ({
    listContainer: {
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        paddingBottom: theme.spacing(8),
    },
    list: {
        paddingTop: theme.spacing(0),
        flexGrow: 1,
    },
    modificationsTitle: {
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        overflow: 'hidden',
    },
    toolbar: {
        padding: theme.spacing(0),
        border: theme.spacing(1),
        minHeight: 0,
        margin: 0,
        flexShrink: 0,
    },

    toolbarIcon: {
        marginRight: theme.spacing(1),
    },
    toolbarCheckbox: {
        marginLeft: theme.spacing(1.5),
    },
    filler: {
        flexGrow: 1,
    },
    dividerTool: {
        background: theme.palette.primary.main,
    },
    circularProgress: {
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
    },
    formattedMessageProgress: {
        marginTop: theme.spacing(2),
    },
    notification: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(4),
        textAlign: 'center',
        color: theme.palette.primary.main,
    },
    icon: {
        width: theme.spacing(3),
    },
}));

function isChecked(s1: number) {
    return s1 !== 0;
}

function isPartial(s1: number, s2: number) {
    if (s1 === 0) {
        return false;
    }
    return s1 !== s2;
}

const EventModificationScenarioEditor = () => {
    const intl = useIntl();
    const notificationIdList = useSelector(
        (state: ReduxState) => state.notificationIdList
    );
    const params = useParams();
    const studyUuid = params?.studyUuid
        ? decodeURIComponent(params.studyUuid)
        : undefined;
    const { snackInfo, snackError } = useSnackMessage();
    const [events, setEvents] = useState<Event[]>([]);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const currentNodeIdRef = useRef<UUID>(); // initial empty to get first update
    const [pendingState, setPendingState] = useState(false);

    const [selectedItems, setSelectedItems] = useState<Set<Event>>(new Set());
    const [toggleSelectAll, setToggleSelectAll] = useState<boolean>(false);

    const [isDragging, setIsDragging] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState<
        | {
              eventType?: EventType;
              equipmentId: string;
              equipmentType: string;
          }
        | undefined
    >();
    const [editData, setEditData] = useState<Event | undefined>(undefined);
    const [editDataFetchStatus, setEditDataFetchStatus] = useState(
        FetchStatus.IDLE
    );
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector(
        (state: ReduxState) => state.studyUpdated
    );
    const [messageId, setMessageId] = useState('');
    const [launchLoader, setLaunchLoader] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    const handleCloseDialog = () => {
        setEditDialogOpen(undefined);
        setEditData(undefined);
    };

    const fillNotification = useCallback(
        (study: StudyUpdated, messageId: string) => {
            // (work for all users)
            // specific message id for each action type
            setMessageId(messageId);
            dispatch(
                addNotification([
                    study.eventData.headers['parentNode'],
                    ...(study.eventData.headers['nodes'] ?? []),
                ])
            );
        },
        [dispatch]
    );

    const manageNotification = useCallback(
        (study: StudyUpdated) => {
            let messageId = '';
            if (
                study.eventData.headers['updateType'] ===
                EventCrudType.EVENT_CREATING_IN_PROGRESS
            ) {
                messageId = 'DynamicSimulationEventCreating';
            } else if (
                study.eventData.headers['updateType'] ===
                EventCrudType.EVENT_UPDATING_IN_PROGRESS
            ) {
                messageId = 'DynamicSimulationEventUpdating';
            } else if (
                study.eventData.headers['updateType'] ===
                EventCrudType.EVENT_DELETING_IN_PROGRESS
            ) {
                messageId = 'DynamicSimulationEventDeleting';
            }
            fillNotification(study, messageId);
        },
        [fillNotification]
    );

    const doFetchEvents = useCallback(() => {
        // Do not fetch modifications on the root node
        if (currentNode?.type !== 'NETWORK_MODIFICATION') {
            return;
        }
        setLaunchLoader(true);
        fetchDynamicSimulationEvents(studyUuid ?? '', currentNode.id)
            .then((res) => {
                // Check if during asynchronous request currentNode has already changed
                // otherwise accept fetch results
                if (currentNode.id === currentNodeIdRef.current) {
                    setEvents(res);
                }
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                });
            })
            .finally(() => {
                setPendingState(false);
                setLaunchLoader(false);
                dispatch(setModificationsInProgress(false));
            });
    }, [studyUuid, currentNode?.id, currentNode?.type, snackError, dispatch]);

    useEffect(() => {
        // first time with currentNode initialized then fetch events
        // (because if currentNode is not initialized, doFetchEvents silently does nothing)
        // OR next time if currentNodeId changed then fetch events
        if (
            currentNode &&
            (!currentNodeIdRef.current ||
                currentNodeIdRef.current !== currentNode.id)
        ) {
            currentNodeIdRef.current = currentNode.id;
            // Current node has changed then clear the events list
            setEvents([]);
            doFetchEvents();
        }
    }, [currentNode, doFetchEvents]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                currentNodeIdRef.current !==
                studyUpdatedForce.eventData.headers['parentNode']
            ) {
                return;
            }

            if (
                Object.values<string>(EventCrudType).includes(
                    studyUpdatedForce.eventData.headers['updateType'] ?? ''
                )
            ) {
                dispatch(setModificationsInProgress(true));
                setPendingState(true);
                manageNotification(studyUpdatedForce);
            }
            // notify  finished action (success or error => we remove the loader)
            // error handling in dialog for each equipment (snackbar with specific error showed only for current user)
            if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                EVENT_CRUD_FINISHED
            ) {
                // fetch events because it must have changed
                // Do not clear the events list, because currentNode is the concerned one
                // this allows to append new events to the existing list.
                doFetchEvents();
                dispatch(
                    removeNotificationByNode([
                        studyUpdatedForce.eventData.headers['parentNode'],
                        ...(studyUpdatedForce.eventData.headers['nodes'] ?? []),
                    ])
                );
            }
        }
    }, [dispatch, doFetchEvents, manageNotification, studyUpdatedForce]);

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const classes = useStyles();

    const doDeleteEvent = useCallback(() => {
        const selectedEvents = [...selectedItems.values()];
        deleteDynamicSimulationEvents(
            studyUuid ?? '',
            currentNode.id,
            selectedEvents
        ).catch((errMsg) => {
            snackError({
                messageTxt: errMsg,
                headerId: 'DynamicSimulationEventDeleteError',
            });
        });
    }, [currentNode?.id, selectedItems, snackError, studyUuid]);

    /*function removeNullFields(data: Event) {
        let dataTemp = data;
        if (dataTemp) {
            (Object.keys(dataTemp) as EventPropertyName[]).forEach((key) => {
                if (
                    dataTemp[key] &&
                    dataTemp[key] !== null &&
                    typeof dataTemp[key] === 'object'
                ) {
                    dataTemp[key] = removeNullFields(dataTemp[key]);
                }

                if (dataTemp[key] === null) {
                    delete dataTemp[key];
                }
            });
        }
        return dataTemp;
    }*/

    const doEditEvent = (event: Event) => {
        setIsUpdate(true);
        setEditDialogOpen({
            eventType: event.eventType,
            equipmentId: event.equipmentId,
            equipmentType: event.equipmentType,
        });
        //setEditDataFetchStatus(FetchStatus.RUNNING);
        /*getEvent(studyUuid ?? '', currentNode.id, event.equipmentId)
            .then((event) => {
                //remove all null values to avoid showing a "null" in the forms
                setEditData(event ? removeNullFields(event) : undefined);
                setEditDataFetchStatus(FetchStatus.SUCCEED);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                });
                setEditDataFetchStatus(FetchStatus.FAILED);
            });*/
    };

    const toggleSelectAllEvents = useCallback(() => {
        setToggleSelectAll((oldVal: boolean) => !oldVal);
    }, []);

    const handleDragEnd = useCallback(
        ({ source, destination }: DropResult) => {
            setIsDragging(false);
            if (
                !currentNode?.id ||
                destination === null ||
                source.index === destination?.index
            ) {
                return;
            }
            const res = [...events];
            const [item] = res.splice(source.index, 1);
            const before = res[destination?.index ?? source.index]?.uuid || '';

            res.splice(
                destination ? destination.index : events.length,
                0,
                item
            );

            /* doing the local change before update to server */
            setEvents(res);
            moveDynamicSimulationEvent(
                studyUuid ?? '',
                currentNode.id,
                item.uuid,
                before
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'errReorderModificationMsg',
                });
                setEvents(events); // rollback
            });
        },
        [events, studyUuid, currentNode?.id, snackError]
    );

    const isLoading = () => {
        return (
            notificationIdList.filter(
                (notification) => notification === currentNode?.id
            ).length > 0
        );
    };

    const renderEventList = () => {
        return (
            <DragDropContext
                onDragEnd={handleDragEnd}
                onDragStart={() => setIsDragging(true)}
            >
                <Droppable
                    droppableId="event-modification-list"
                    isDropDisabled={isLoading() || isAnyNodeBuilding}
                >
                    {(provided) => (
                        <div
                            className={classes.listContainer}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <CheckboxList
                                className={classes.list}
                                onChecked={setSelectedItems}
                                values={events}
                                initialSelection={[]}
                                itemComparator={(a, b) =>
                                    a.eventOrder === b.eventOrder
                                }
                                itemRenderer={(props: any) => (
                                    <EventListItem
                                        key={props.item.equipmentId}
                                        onEdit={doEditEvent}
                                        isDragging={isDragging}
                                        isOneNodeBuilding={isAnyNodeBuilding}
                                        disabled={isLoading()}
                                        {...props}
                                    />
                                )}
                                toggleSelectAll={toggleSelectAll}
                            />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        );
    };

    const renderEventListTitleLoading = () => {
        return (
            <div className={classes.modificationsTitle}>
                <div className={classes.icon}>
                    <CircularProgress
                        size={'1em'}
                        className={classes.circularProgress}
                    />
                </div>
                <Typography noWrap>
                    <FormattedMessage id={messageId} />
                </Typography>
            </div>
        );
    };

    const renderEventListTitleUpdating = () => {
        return (
            <div className={classes.modificationsTitle}>
                <div className={classes.icon}>
                    <CircularProgress
                        size={'1em'}
                        className={classes.circularProgress}
                    />
                </div>
                <Typography noWrap>
                    <FormattedMessage
                        id={'DynamicSimulationEventUpdatingList'}
                    />
                </Typography>
            </div>
        );
    };

    const renderEventListTitle = () => {
        return (
            <div className={classes.modificationsTitle}>
                <div className={classes.icon}>
                    {pendingState && (
                        <CircularProgress
                            size={'1em'}
                            className={classes.circularProgress}
                        />
                    )}
                </div>
                <Typography noWrap>
                    <FormattedMessage
                        id={'DynamicSimulationEventCount'}
                        values={{
                            count: events ? events?.length : '',
                            hide: pendingState,
                        }}
                    />
                </Typography>
            </div>
        );
    };

    const renderPaneSubtitle = () => {
        if (isLoading() && messageId) {
            return renderEventListTitleLoading();
        }
        if (launchLoader) {
            return renderEventListTitleUpdating();
        }
        return renderEventListTitle();
    };

    return (
        <>
            <Toolbar className={classes.toolbar}>
                <Checkbox
                    className={classes.toolbarCheckbox}
                    color={'primary'}
                    edge="start"
                    checked={isChecked(selectedItems.size)}
                    indeterminate={isPartial(
                        selectedItems.size,
                        events?.length
                    )}
                    disableRipple
                    onClick={toggleSelectAllEvents}
                />
                <div className={classes.filler} />
                <IconButton
                    onClick={doDeleteEvent}
                    size={'small'}
                    className={classes.toolbarIcon}
                    disabled={
                        !(selectedItems?.size > 0) ||
                        isAnyNodeBuilding ||
                        !currentNode
                    }
                >
                    <DeleteIcon />
                </IconButton>
            </Toolbar>
            {renderPaneSubtitle()}

            {renderEventList()}

            {editDialogOpen && (
                <DynamicSimulationEventDialog
                    open={!!editDialogOpen}
                    studyUuid={studyUuid ?? ''}
                    currentNodeId={currentNode?.id}
                    equipmentId={editDialogOpen.equipmentId}
                    equipmentType={editDialogOpen.equipmentType}
                    isUpdate={true}
                    onClose={() => handleCloseDialog()}
                    editDataFetchStatus={''}
                    title={intl.formatMessage(
                        {
                            id: `${editDialogOpen.eventType}/${editDialogOpen.equipmentType}`,
                        },
                        { computedLabel: '' }
                    )}
                />
            )}
        </>
    );
};

export default EventModificationScenarioEditor;
