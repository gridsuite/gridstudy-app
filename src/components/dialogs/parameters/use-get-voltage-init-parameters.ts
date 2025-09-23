/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import {
    ComputingType,
    NotificationsUrlKeys,
    useNotificationsListener,
    useSnackMessage,
    VoltageInitStudyParameters,
} from '@gridsuite/commons-ui';
import { useOptionalServiceStatus } from '../../../hooks/use-optional-service-status';
import { OptionalServicesNames, OptionalServicesStatus } from '../../utils/optional-services';
import { getVoltageInitStudyParameters } from '../../../services/study/voltage-init';
import type { UUID } from 'node:crypto';
import { haveComputationParametersChanged } from './use-parameters-notification';
import { isComputationParametersUpdatedNotification } from 'types/notification-types';

export const useGetVoltageInitParameters = (): VoltageInitStudyParameters | null => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [voltageInitParams, setVoltageInitParams] = useState<VoltageInitStudyParameters | null>(null);

    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const voltageInitAvailabilityRef = useRef(voltageInitAvailability);
    voltageInitAvailabilityRef.current = voltageInitAvailability;

    const fetchVoltageInitStudyParameters = useCallback(
        (studyUuid: UUID) => {
            getVoltageInitStudyParameters(studyUuid)
                .then((params) => {
                    setVoltageInitParams(params);
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
        if (studyUuid && voltageInitAvailability === OptionalServicesStatus.Up) {
            fetchVoltageInitStudyParameters(studyUuid);
        }
    }, [voltageInitAvailability, studyUuid, fetchVoltageInitStudyParameters]);

    const voltageInitParamsUpdated = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (
                studyUuid &&
                voltageInitAvailability === OptionalServicesStatus.Up &&
                isComputationParametersUpdatedNotification(eventData) &&
                haveComputationParametersChanged(ComputingType.VOLTAGE_INITIALIZATION, eventData)
            ) {
                fetchVoltageInitStudyParameters(studyUuid);
            }
        },
        [studyUuid, fetchVoltageInitStudyParameters, voltageInitAvailability]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: voltageInitParamsUpdated,
    });

    return voltageInitParams;
};
