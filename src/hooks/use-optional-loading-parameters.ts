/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { fetchSpreadsheetParameters } from '../services/study/spreadsheet';
import type { PartialDeep } from 'type-fest';
import { SpreadsheetOptionalLoadingParameters } from '../components/spreadsheet-view/types/spreadsheet.type';
import { isSpreadsheetParametersUpdatedNotification } from '../types/notification-types';
import { UUID } from 'crypto';
import { useDispatch } from 'react-redux';
import { updateSpreadsheetPartialData } from '../redux/actions';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';

export function useOptionalLoadingParameters(studyUuid: UUID) {
    const dispatch = useDispatch();

    const updateRemoteSpreadsheetParameters = useCallback(() => {
        if (studyUuid) {
            fetchSpreadsheetParameters(studyUuid).then((parameters) => {
                dispatch(updateSpreadsheetPartialData(parameters));
            });
        }
    }, [dispatch, studyUuid]);

    const updateRemoteSpreadsheetParametersListenerCallback = useCallback(
        (event: MessageEvent) => {
            const eventData: PartialDeep<SpreadsheetOptionalLoadingParameters> = JSON.parse(event.data);
            if (isSpreadsheetParametersUpdatedNotification(eventData) && eventData.headers.studyUuid === studyUuid) {
                console.debug('Event: spreadsheet parameters updated', eventData);
                updateRemoteSpreadsheetParameters();
            }
        },
        [studyUuid, updateRemoteSpreadsheetParameters]
    );

    useEffect(() => {
        updateRemoteSpreadsheetParameters();
    }, [updateRemoteSpreadsheetParameters]);

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: updateRemoteSpreadsheetParametersListenerCallback,
    });
}
