/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    useSnackMessage,
    getStudyShortCircuitParameters,
    NotificationsUrlKeys,
    ShortCircuitParametersInfos,
    useNotificationsListener,
    ComputingType,
} from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { OptionalServicesNames, OptionalServicesStatus } from '../../utils/optional-services';
import { useOptionalServiceStatus } from '../../../hooks/use-optional-service-status';
import { AppState, StudyUpdatedEventData } from 'redux/reducer';
import { UUID } from 'crypto';
import { haveComputationParametersChanged } from './use-parameters-notification';

export const useGetShortCircuitParameters = (): ShortCircuitParametersInfos | null => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [shortCircuitParams, setShortCircuitParams] = useState<ShortCircuitParametersInfos | null>(null);

    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);

    const fetchShortCircuitParameters = useCallback(
        (studyUuid: UUID) => {
            getStudyShortCircuitParameters(studyUuid)
                .then((params) => {
                    setShortCircuitParams(params);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        },
        [snackError]
    );

    useEffect(() => {
        if (studyUuid && shortCircuitAvailability === OptionalServicesStatus.Up) {
            fetchShortCircuitParameters(studyUuid);
        }
    }, [shortCircuitAvailability, studyUuid, fetchShortCircuitParameters]);

    const shortCircuitParamsUpdated = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (
                studyUuid &&
                eventData.headers.studyUuid === studyUuid &&
                shortCircuitAvailability === OptionalServicesStatus.Up &&
                haveComputationParametersChanged(ComputingType.SHORT_CIRCUIT, eventData as StudyUpdatedEventData)
            ) {
                fetchShortCircuitParameters(studyUuid);
            }
        },
        [studyUuid, fetchShortCircuitParameters, shortCircuitAvailability]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: shortCircuitParamsUpdated,
    });

    return shortCircuitParams;
};
