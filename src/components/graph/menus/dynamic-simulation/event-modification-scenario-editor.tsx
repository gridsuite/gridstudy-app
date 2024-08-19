/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Checkbox, CircularProgress, Toolbar, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckboxList from '../../../utils/checkbox-list';
import IconButton from '@mui/material/IconButton';
import { useIsAnyNodeBuilding } from '../../../utils/is-any-node-building-hook';
import { addNotification, removeNotificationByNode, setModificationsInProgress } from '../../../../redux/actions';
import { EVENT_CRUD_FINISHED, EventCrudType } from 'components/network/constants.type';
import { UUID } from 'crypto';
import { AppState, StudyUpdated } from '../../../../redux/reducer';
import { Event, EventType } from '../../../dialogs/dynamicsimulation/event/types/event.type';
import { deleteDynamicSimulationEvents, fetchDynamicSimulationEvents } from '../../../../services/dynamic-simulation';
import { EventListItem } from './event-list-item';
import { DynamicSimulationEventDialog } from '../../../dialogs/dynamicsimulation/event/dynamic-simulation-event-dialog';
import { getStartTime } from '../../../dialogs/dynamicsimulation/event/model/event.model';
import { isChecked, isPartial, styles } from '../network-modification-node-editor';
import { EQUIPMENT_TYPE_LABEL_KEYS } from '../../util/model-constants';
import { areUuidsEqual } from 'components/utils/utils';
import { AppDispatch } from '../../../../redux/store';

const EventModificationScenarioEditor = () => {
    const intl = useIntl();
    const notificationIdList = useSelector((state: AppState) => state.notificationIdList);
    const params = useParams();
    const studyUuid = params?.studyUuid ? decodeURIComponent(params.studyUuid) : undefined;
    const { snackError } = useSnackMessage();
    const [events, setEvents] = useState<Event[]>([]);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const currentNodeIdRef = useRef<UUID>(); // initial empty to get first update
    const [pendingState, setPendingState] = useState(false);

    const [selectedItems, setSelectedItems] = useState<Event[]>([]);

    const [editDialogOpen, setEditDialogOpen] = useState<
        | {
              eventType?: EventType;
              equipmentId: string;
              equipmentType: keyof typeof EQUIPMENT_TYPE_LABEL_KEYS;
          }
        | undefined
    >();

    const dispatch = useDispatch<AppDispatch>();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const [messageId, setMessageId] = useState('');
    const [launchLoader, setLaunchLoader] = useState(false);

    const handleCloseDialog = () => {
        setEditDialogOpen(undefined);
    };

    const fillNotification = useCallback(
        (study: StudyUpdated, messageId: string) => {
            // (work for all users)
            // specific message id for each action type
            setMessageId(messageId);
            dispatch(
                addNotification([study.eventData.headers['parentNode'], ...(study.eventData.headers['nodes'] ?? [])])
            );
        },
        [dispatch]
    );

    const manageNotification = useCallback(
        (study: StudyUpdated) => {
            let messageId = '';
            if (study.eventData.headers['updateType'] === EventCrudType.EVENT_CREATING_IN_PROGRESS) {
                messageId = 'DynamicSimulationEventCreating';
            } else if (study.eventData.headers['updateType'] === EventCrudType.EVENT_UPDATING_IN_PROGRESS) {
                messageId = 'DynamicSimulationEventUpdating';
            } else if (study.eventData.headers['updateType'] === EventCrudType.EVENT_DELETING_IN_PROGRESS) {
                messageId = 'DynamicSimulationEventDeleting';
            }
            fillNotification(study, messageId);
        },
        [fillNotification]
    );

    const updateSelectedItems = useCallback((events: Event[]) => {
        const toKeepIdsSet = new Set(events.map((e) => e.uuid));
        setSelectedItems((oldselectedItems) => oldselectedItems.filter((s) => toKeepIdsSet.has(s.uuid)));
    }, []);

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
                    updateSelectedItems(res);
                    // sort by start time
                    const sortedEvents = res.sort((a, b) => getStartTime(a) - getStartTime(b));
                    setEvents(sortedEvents);
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
    }, [currentNode?.type, currentNode?.id, studyUuid, updateSelectedItems, snackError, dispatch]);

    useEffect(() => {
        // first time with currentNode initialized then fetch events
        // (because if currentNode is not initialized, doFetchEvents silently does nothing)
        // OR next time if currentNodeId changed then fetch events
        if (currentNode && (!currentNodeIdRef.current || currentNodeIdRef.current !== currentNode.id)) {
            currentNodeIdRef.current = currentNode.id;
            // Current node has changed then clear the events list
            setEvents([]);
            doFetchEvents();
        }
    }, [currentNode, doFetchEvents]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (currentNodeIdRef.current !== studyUpdatedForce.eventData.headers['parentNode']) {
                return;
            }

            if (
                Object.values<string>(EventCrudType).includes(studyUpdatedForce.eventData.headers['updateType'] ?? '')
            ) {
                dispatch(setModificationsInProgress(true));
                setPendingState(true);
                manageNotification(studyUpdatedForce);
            }
            // notify  finished action (success or error => we remove the loader)
            // error handling in dialog for each equipment (snackbar with specific error showed only for current user)
            if (studyUpdatedForce.eventData.headers['updateType'] === EVENT_CRUD_FINISHED) {
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

    const doDeleteEvent = useCallback(() => {
        const selectedEvents = [...selectedItems];
        deleteDynamicSimulationEvents(
            studyUuid ?? '',
            // @ts-expect-error TODO: manage null case
            currentNode?.id,
            selectedEvents
        ).catch((errMsg) => {
            snackError({
                messageTxt: errMsg,
                headerId: 'DynamicSimulationEventDeleteError',
            });
        });
    }, [currentNode?.id, selectedItems, snackError, studyUuid]);

    const doEditEvent = (event: Event) => {
        setEditDialogOpen({
            eventType: event.eventType,
            equipmentId: event.equipmentId,
            // @ts-expect-error TODO: sub range of equipments types
            equipmentType: event.equipmentType,
        });
    };

    const toggleSelectAllEvents = useCallback(() => {
        setSelectedItems((oldVals: Event[]) => (oldVals.length === 0 ? events : []));
    }, [events]);

    const isLoading = () => {
        return notificationIdList.filter((notification) => notification === currentNode?.id).length > 0;
    };

    const renderEventList = () => {
        return (
            <CheckboxList
                className={styles.list}
                onChecked={setSelectedItems}
                checkedValues={selectedItems}
                values={events}
                itemComparator={areUuidsEqual}
                itemRenderer={(props: any) => (
                    <EventListItem
                        key={props.item.equipmentId}
                        onEdit={doEditEvent}
                        isOneNodeBuilding={isAnyNodeBuilding}
                        disabled={isLoading()}
                        {...props}
                    />
                )}
            />
        );
    };

    const renderEventListTitleLoading = () => {
        return (
            <Box sx={styles.modificationsTitle}>
                <Box sx={styles.icon}>
                    <CircularProgress size={'1em'} sx={styles.circularProgress} />
                </Box>
                <Typography noWrap>
                    <FormattedMessage id={messageId} />
                </Typography>
            </Box>
        );
    };

    const renderEventListTitleUpdating = () => {
        return (
            <Box sx={styles.modificationsTitle}>
                <Box sx={styles.icon}>
                    <CircularProgress size={'1em'} sx={styles.circularProgress} />
                </Box>
                <Typography noWrap>
                    <FormattedMessage id={'DynamicSimulationEventUpdatingList'} />
                </Typography>
            </Box>
        );
    };

    const renderEventListTitle = () => {
        return (
            <Box sx={styles.modificationsTitle}>
                <Box sx={styles.icon}>
                    {pendingState && <CircularProgress size={'1em'} sx={styles.circularProgress} />}
                </Box>
                <Typography noWrap>
                    <FormattedMessage
                        id={'DynamicSimulationEventCount'}
                        values={{
                            count: events ? events?.length : '',
                            hide: pendingState,
                        }}
                    />
                </Typography>
            </Box>
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
            <Toolbar sx={styles.toolbar}>
                <Checkbox
                    sx={styles.toolbarCheckbox}
                    color={'primary'}
                    edge="start"
                    checked={isChecked(selectedItems.length)}
                    indeterminate={isPartial(selectedItems.length, events?.length)}
                    disableRipple
                    onClick={toggleSelectAllEvents}
                />
                <Box sx={styles.filler} />
                <IconButton
                    onClick={doDeleteEvent}
                    size={'small'}
                    sx={styles.toolbarIcon}
                    disabled={selectedItems.length === 0 || isAnyNodeBuilding || !currentNode}
                >
                    <DeleteIcon />
                </IconButton>
            </Toolbar>
            {renderPaneSubtitle()}

            {renderEventList()}

            {editDialogOpen && (
                <DynamicSimulationEventDialog
                    studyUuid={studyUuid ?? ''}
                    // @ts-expect-error TODO: manage null case
                    currentNodeId={currentNode?.id}
                    equipmentId={editDialogOpen.equipmentId}
                    equipmentType={editDialogOpen.equipmentType}
                    onClose={() => handleCloseDialog()}
                    title={intl.formatMessage(
                        {
                            id: `Event${editDialogOpen.eventType}${
                                EQUIPMENT_TYPE_LABEL_KEYS[editDialogOpen.equipmentType]
                            }`,
                        },
                        { computedLabel: '' }
                    )}
                />
            )}
        </>
    );
};

export default EventModificationScenarioEditor;
