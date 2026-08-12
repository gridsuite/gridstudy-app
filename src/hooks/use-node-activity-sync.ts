/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setNodeActivities } from '../redux/actions';
import { fetchNodeActivities } from '../services/study/node-activities';
import {
    type CommonStudyEventData,
    isNodeActivitiesUpdatedNotification,
    parseEventData,
} from '../types/notification-types';

export function useNodeActivitySync(studyUuid: UUID | null) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (studyUuid) {
            fetchNodeActivities(studyUuid)
                .then((activities) => dispatch(setNodeActivities(activities)))
                .catch((error) => console.error('Failed to fetch node activities', error));
        }
    }, [studyUuid, dispatch]);

    const handleNodeActivitiesNotification = useCallback(
        (event: MessageEvent) => {
            const eventData = parseEventData<CommonStudyEventData>(event);
            if (eventData && isNodeActivitiesUpdatedNotification(eventData)) {
                dispatch(setNodeActivities(JSON.parse(eventData.payload)));
            }
        },
        [dispatch]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleNodeActivitiesNotification,
    });
}
