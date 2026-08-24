/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    CheckBoxList,
    type MuiStyles,
    NotificationsUrlKeys,
    snackWithFallback,
    useNotificationsListener,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { Box, Checkbox, CircularProgress, Toolbar, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useIsEventEditBlocked, useIsNodeUpdating } from 'components/node-activity/hooks/use-node-activity';
import type { UUID } from 'node:crypto';
import { Event, EventType } from '../../../dialogs/dynamicsimulation/event/types/event.type';
import { DynamicSimulationEventDialog } from '../../../dialogs/dynamicsimulation/event/dynamic-simulation-event-dialog';
import { getStartTime, getStartTimeUnit } from '../../../dialogs/dynamicsimulation/event/model/event.model';
import { isChecked, isPartial, styles } from '../network-modifications/network-modification-node-editor-utils';
import { EQUIPMENT_TYPE_LABEL_KEYS } from '../../util/model-constants';
import EditIcon from '@mui/icons-material/Edit';
import { AppState } from '../../../../redux/reducer.type';
import { isEventCrudFinishedNotification, parseEventData, CommonStudyEventData } from 'types/notification-types';
import {
    deleteDynamicSimulationEvents,
    fetchDynamicSimulationEvents,
} from '../../../../services/study/dynamic-simulation';

const paperStyles = {
    paper: (theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.paper,
    }),
} as const satisfies MuiStyles;

const EventModificationScenarioEditor = memo(() => {
    const intl = useIntl();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [events, setEvents] = useState<Event[]>([]);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const currentNodeIdRef = useRef<UUID>(null); // initial empty to get first update

    const [selectedItems, setSelectedItems] = useState<Event[]>([]);

    const [editDialogOpen, setEditDialogOpen] = useState<
        | {
              eventType?: EventType;
              equipmentId: string;
              equipmentType: keyof typeof EQUIPMENT_TYPE_LABEL_KEYS;
          }
        | undefined
    >();

    const [launchLoader, setLaunchLoader] = useState(false);

    const handleCloseDialog = () => {
        setEditDialogOpen(undefined);
    };

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
                snackWithFallback(snackError, error);
            })
            .finally(() => {
                setLaunchLoader(false);
            });
    }, [currentNode?.type, currentNode?.id, studyUuid, updateSelectedItems, snackError]);

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

    const handleEvent = useCallback(
        (event: MessageEvent) => {
            const eventData = parseEventData<CommonStudyEventData>(event);
            if (!eventData) {
                return;
            }
            // success or error, the events may have changed : the spinner is driven by the node activity
            if (isEventCrudFinishedNotification(eventData)) {
                // append to the existing list : currentNode is the concerned one, so it is not cleared
                doFetchEvents();
            }
        },
        [doFetchEvents]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleEvent,
    });

    const isEventEditBlocked = useIsEventEditBlocked(currentNode?.id);
    const isNodeUpdating = useIsNodeUpdating(currentNode?.id);

    const doDeleteEvent = useCallback(() => {
        if (!studyUuid || !currentNode?.id) {
            return;
        }
        const selectedEvents = [...selectedItems];
        deleteDynamicSimulationEvents(studyUuid, currentNode.id, selectedEvents).catch((error) => {
            snackWithFallback(snackError, error, { headerId: 'DynamicSimulationEventDeleteError' });
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

        return intl.formatMessage(
            {
                id: `Event${item.eventType}${EQUIPMENT_TYPE_LABEL_KEYS[item.equipmentType]}`,
            },
            {
                ...computedValues,
            }
        );
    };

    const handleSecondaryAction = useCallback(
        (item: Event, isItemHovered?: boolean) =>
            isItemHovered && !isEventEditBlocked ? (
                <IconButton onClick={() => doEditEvent(item)} size={'small'} sx={styles.iconEdit}>
                    <EditIcon />
                </IconButton>
            ) : null,
        [isEventEditBlocked]
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
                isDisabled={() => isEventEditBlocked}
                divider
            />
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
                    {isNodeUpdating && <CircularProgress size={'1em'} sx={styles.circularProgress} />}
                </Box>
                <Typography noWrap>
                    <FormattedMessage
                        id={'DynamicSimulationEventCount'}
                        values={{
                            count: events ? events?.length : '',
                            hide: isNodeUpdating,
                        }}
                    />
                </Typography>
            </Box>
        );
    };

    const renderPaneSubtitle = () => {
        if (launchLoader) {
            return renderEventListTitleUpdating();
        }
        return renderEventListTitle();
    };

    return (
        <Box sx={paperStyles.paper}>
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
                    disabled={selectedItems.length === 0 || isEventEditBlocked || !currentNode}
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
        </Box>
    );
});

export default EventModificationScenarioEditor;
