/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import {
    ComputingType,
    getPccMinStudyParameters,
    NotificationsUrlKeys,
    PccMinParameters,
    useNotificationsListener,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useOptionalServiceStatus } from '../../../hooks/use-optional-service-status';
import { OptionalServicesNames, OptionalServicesStatus } from '../../utils/optional-services';
import type { UUID } from 'node:crypto';
import { haveComputationParametersChanged } from './use-parameters-notification';
import { isComputationParametersUpdatedNotification } from 'types/notification-types';

export const useGetPccMinParameters = (): PccMinParameters | null => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [pccMinParams, setPccMinParams] = useState<PccMinParameters | null>(null);

    const pccMinAvailability = useOptionalServiceStatus(OptionalServicesNames.PccMin);

    const fetchPccMinStudyParameters = useCallback(
        (studyUuid: UUID) => {
            getPccMinStudyParameters(studyUuid)
                .then((params) => {
                    setPccMinParams(params);
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
        if (studyUuid && pccMinAvailability === OptionalServicesStatus.Up) {
            fetchPccMinStudyParameters(studyUuid);
        }
    }, [pccMinAvailability, studyUuid, fetchPccMinStudyParameters]);

    const pccMinParamsUpdated = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (
                studyUuid &&
                pccMinAvailability === OptionalServicesStatus.Up &&
                isComputationParametersUpdatedNotification(eventData) &&
                haveComputationParametersChanged(ComputingType.PCC_MIN, eventData)
            ) {
                fetchPccMinStudyParameters(studyUuid);
            }
        },
        [studyUuid, fetchPccMinStudyParameters, pccMinAvailability]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: pccMinParamsUpdated,
    });

    return pccMinParams;
};
