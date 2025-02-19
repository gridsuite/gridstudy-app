/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useOptionalServiceStatus } from '../../../../hooks/use-optional-service-status';
import { OptionalServicesNames, OptionalServicesStatus } from '../../../utils/optional-services';
import ComputingType from '../../../computing-status/computing-type';
import { isComputationParametersUpdated } from '../common/computation-parameters-util';
import { UUID } from 'crypto';
import { StateEstimationParameters } from './state-estimation-parameters-utils';
import { getStateEstimationStudyParameters } from '../../../../services/study/state-estimation';

export type UseGetStateEstimationParametersProps = [
    StateEstimationParameters | null,
    Dispatch<SetStateAction<StateEstimationParameters | null>>
];

export const useGetStateEstimationParameters = (): UseGetStateEstimationParametersProps => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const studyUpdated = useSelector((state: AppState) => state.studyUpdated);
    const { snackError } = useSnackMessage();
    const [stateEstimationParams, setStateEstimationParams] = useState<StateEstimationParameters | null>(null);

    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);
    const stateEstimationAvailabilityRef = useRef(stateEstimationAvailability);
    stateEstimationAvailabilityRef.current = stateEstimationAvailability;

    const fetchStateEstimationStudyParameters = useCallback(
        (studyUuid: UUID) => {
            getStateEstimationStudyParameters(studyUuid)
                .then((params: StateEstimationParameters) => {
                    setStateEstimationParams(params);
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
        if (studyUuid && stateEstimationAvailability === OptionalServicesStatus.Up) {
            fetchStateEstimationStudyParameters(studyUuid);
        }
    }, [stateEstimationAvailability, studyUuid, fetchStateEstimationStudyParameters]);

    // fetch the parameter if STATE_ESTIMATION  notification type is received.
    useEffect(() => {
        if (
            studyUuid &&
            stateEstimationAvailabilityRef.current === OptionalServicesStatus.Up &&
            isComputationParametersUpdated(ComputingType.STATE_ESTIMATION, studyUpdated)
        ) {
            fetchStateEstimationStudyParameters(studyUuid);
        }
    }, [studyUuid, fetchStateEstimationStudyParameters, studyUpdated]);

    return [stateEstimationParams, setStateEstimationParams];
};
