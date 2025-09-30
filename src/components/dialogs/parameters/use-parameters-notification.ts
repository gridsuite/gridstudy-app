/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ComputingType,
    isValidComputingType,
    NotificationsUrlKeys,
    OptionalServicesStatus,
    useNotificationsListener,
    UseParametersBackendReturnProps,
} from '@gridsuite/commons-ui';
import { AppState } from '../../../redux/reducer';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    ComputationParametersUpdatedEventData,
    isComputationParametersUpdatedNotification,
} from 'types/notification-types';

export const haveComputationParametersChanged = (
    type: ComputingType,
    computationParametersUpdatedEventData: ComputationParametersUpdatedEventData
) => {
    return (
        computationParametersUpdatedEventData.headers &&
        isValidComputingType(computationParametersUpdatedEventData.headers.computationType) &&
        computationParametersUpdatedEventData.headers.computationType === type
    );
};

export const isComputationParametersUpdated = (type: ComputingType, eventData: any) => {
    if (isComputationParametersUpdatedNotification(eventData)) {
        return haveComputationParametersChanged(type, eventData);
    }
    return false;
};

export const useParametersNotification = <T extends ComputingType>(
    type: T,
    optionalServiceStatus: OptionalServicesStatus | undefined,
    parametersBackend: UseParametersBackendReturnProps<T>
) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [, , fetchProvider, , , , fetchParameters, , , ,] = parametersBackend;

    // we need to fetch provider and parameters when ever a computationParametersUpdated notification received.
    const onComputationParametersUpdated = useCallback(
        (event: MessageEvent<string>) => {
            if (!studyUuid || optionalServiceStatus !== OptionalServicesStatus.Up) {
                return;
            }
            const eventData = JSON.parse(event.data);
            if (isComputationParametersUpdated(type, eventData)) {
                fetchProvider(studyUuid);
                fetchParameters(studyUuid);
            }
        },
        [fetchParameters, fetchProvider, optionalServiceStatus, studyUuid, type]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: onComputationParametersUpdated });
};
