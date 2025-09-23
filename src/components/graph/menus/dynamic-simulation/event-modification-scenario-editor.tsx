/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckBoxList, useSnackMessage } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Checkbox, CircularProgress, Toolbar, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useIsAnyNodeBuilding } from '../../../utils/is-any-node-building-hook';
import { addNotification, removeNotificationByNode, setModificationsInProgress } from '../../../../redux/actions';
import type { UUID } from 'node:crypto';
import { Event, EventType } from '../../../dialogs/dynamicsimulation/event/types/event.type';
import { DynamicSimulationEventDialog } from '../../../dialogs/dynamicsimulation/event/dynamic-simulation-event-dialog';
import { getStartTime, getStartTimeUnit } from '../../../dialogs/dynamicsimulation/event/model/event.model';
import { isChecked, isPartial, styles } from '../network-modifications/network-modification-node-editor-utils';
import { EQUIPMENT_TYPE_LABEL_KEYS } from '../../util/model-constants';
import EditIcon from '@mui/icons-material/Edit';
import { AppState } from '../../../../redux/reducer';
import { AppDispatch } from '../../../../redux/store';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import {
    EventCreatingInProgressEventData,
    EventDeletingInProgressEventData,
    EventUpdatingInProgressEventData,
    isEventCrudFinishedNotification,
    isEventNotification,
    NotificationType,
} from 'types/notification-types';
import {
    deleteDynamicSimulationEvents,
    fetchDynamicSimulationEvents,
} from '../../../../services/study/dynamic-simulation';

const EventModificationScenarioEditor = () => {
    const intl = useIntl();
    const notificationIdList = useSelector((state: AppState) => state.notificationIdList);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
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
        (
            eventData:
                | EventCreatingInProgressEventData
                | EventUpdatingInProgressEventData
                | EventDeletingInProgressEventData,
            messageId: string
        ) => {
            // (work for all users)
            // specific message id for each action type
            setMessageId(messageId);

            dispatch(addNotification([eventData.headers.parentNode, ...(eventData.headers.nodes ?? [])]));
        },
        [dispatch]
    );

    const manageNotification = useCallback(
        (
            eventData:
                | EventCreatingInProgressEventData
                | EventUpdatingInProgressEventData
                | EventDeletingInProgressEventData
        ) => {
            let messageId = '';
            if (eventData.headers.updateType === NotificationType.EVENT_CREATING_IN_PROGRESS) {
                messageId = 'DynamicSimulationEventCreating';
            } else if (eventData.headers.updateType === NotificationType.EVENT_UPDATING_IN_PROGRESS) {
                messageId = 'DynamicSimulationEventUpdating';
            } else if (eventData.headers.updateType === NotificationType.EVENT_DELETING_IN_PROGRESS) {
                messageId = 'DynamicSimulationEventDeleting';
            }
            fillNotification(eventData, messageId);
        },
        [fillNotification]
    );

    const updateSelectedItems = useCallback((events: Event[]) => {
        const toKeepIdsSet = new Set(events.map((e) => e.uuid));
        setSelectedItems((oldselectedItems) => oldselectedItems.filter((s) => toKeepIdsSet.has(s.uuid)));
    }, []);

    const doFetchEvents = useCallback(() => {
        // Do not fetch modifications on the root node
        if (currentNode?.type !== 'NETWORK_MODIFICATION' || !studyUuid) {
            return;
        }
        setLaunchLoader(true);
        fetchDynamicSimulationEvents(studyUuid, currentNode.id)
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
        if (isEventNotification(studyUpdatedForce.eventData)) {
            const studyUpdatedEventData = studyUpdatedForce?.eventData;

            if (currentNodeIdRef.current !== studyUpdatedEventData.headers.parentNode) {
                return;
            }

            dispatch(setModificationsInProgress(true));
            setPendingState(true);
            manageNotification(studyUpdatedEventData);
        } else if (isEventCrudFinishedNotification(studyUpdatedForce.eventData)) {
            const studyUpdatedEventData = studyUpdatedForce?.eventData;
            // notify  finished action (success or error => we remove the loader)
            // error handling in dialog for each equipment (snackbar with specific error showed only for current user)
            // fetch events because it must have changed
            // Do not clear the events list, because currentNode is the concerned one
            // this allows to append new events to the existing list.
            doFetchEvents();
            dispatch(
                removeNotificationByNode([
                    studyUpdatedEventData.headers.parentNode,
                    ...(studyUpdatedEventData.headers.nodes ?? []),
                ])
            );
        }
    }, [dispatch, doFetchEvents, manageNotification, studyUpdatedForce]);

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const doDeleteEvent = useCallback(() => {
        if (!studyUuid || !currentNode?.id) {
            return;
        }
        const selectedEvents = [...selectedItems];
        deleteDynamicSimulationEvents(studyUuid, currentNode.id, selectedEvents).catch((errMsg) => {
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
            equipmentType: event.equipmentType,
        });
    };

    const toggleSelectAllEvents = useCallback(() => {
        setSelectedItems((oldVals: Event[]) => (oldVals.length === 0 ? events : []));
    }, [events]);

    const isLoading = useCallback(() => {
        return notificationIdList.filter((notification) => notification === currentNode?.id).length > 0;
    }, [currentNode?.id, notificationIdList]);

    const getItemLabel = (item: Event) => {
        if (!studyUuid || !currentNode || !item) {
            return '';
        }

        const computedValues = {
            computedLabel: (
                <>
                    <strong>{item.equipmentId}</strong>
                    <i>{` - ${getStartTime(item)} ${getStartTimeUnit(item)}`}</i>
                </>
            ),
        } as {};

        const equipmentTypeLabelKeys = EQUIPMENT_TYPE_LABEL_KEYS as Record<EQUIPMENT_TYPES, string>;

        return intl.formatMessage(
            {
                id: `Event${item.eventType}${equipmentTypeLabelKeys[item.equipmentType as EQUIPMENT_TYPES]}`,
            },
            {
                ...computedValues,
            }
        );
    };

    const handleSecondaryAction = useCallback(
        (item: Event, isItemHovered?: boolean) =>
            isItemHovered && !isAnyNodeBuilding ? (
                <IconButton
                    onClick={() => doEditEvent(item)}
                    size={'small'}
                    sx={styles.iconEdit}
                    disabled={isLoading()}
                >
                    <EditIcon />
                </IconButton>
            ) : null,
        [isAnyNodeBuilding, isLoading]
    );

    const renderEventList = () => {
        return (
            <CheckBoxList
                sx={{
                    items: {
                        checkboxListItem: {
                            paddingLeft: (theme) => theme.spacing(2),
                            paddingBottom: 'unset',
                            paddingTop: 'unset',
                        },
                    },
                }}
                items={events}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                getItemId={(v: Event) => v.equipmentId}
                getItemLabel={getItemLabel}
                secondaryAction={handleSecondaryAction}
                isDisabled={() => isLoading()}
                divider
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
                    disabled={selectedItems.length === 0 || isAnyNodeBuilding || !currentNode}
                >
                    <DeleteIcon />
                </IconButton>
            </Toolbar>
            {renderPaneSubtitle()}

            {renderEventList()}

            {editDialogOpen && (
                <DynamicSimulationEventDialog
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
