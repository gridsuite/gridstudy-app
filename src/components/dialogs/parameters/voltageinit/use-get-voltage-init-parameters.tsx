/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { VoltageInitParam } from './voltage-init-utils';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useOptionalServiceStatus } from '../../../../hooks/use-optional-service-status';
import { OptionalServicesNames, OptionalServicesStatus } from '../../../utils/optional-services';
import { getVoltageInitStudyParameters } from '../../../../services/study/voltage-init';
import ComputingType from '../../../computing-status/computing-type';
import { isComputationParametersUpdated } from '../common/computation-parameters-util';
import { UUID } from 'crypto';

export const useGetVoltageInitParameters = (): [
    VoltageInitParam | null,
    Dispatch<SetStateAction<VoltageInitParam | null>>
] => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const studyUpdated = useSelector((state: AppState) => state.studyUpdated);
    const { snackError } = useSnackMessage();
    const [voltageInitParams, setVoltageInitParams] = useState<VoltageInitParam | null>(null);

    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const voltageInitAvailabilityRef = useRef(voltageInitAvailability);
    voltageInitAvailabilityRef.current = voltageInitAvailability;

    const fetchVoltageInitStudyParameters = useCallback(
        (studyUuid: UUID) => {
            getVoltageInitStudyParameters(studyUuid)
                .then((params: VoltageInitParam) => {
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

    // fetch the parameter if VOLTAGE_INITIALIZATION  notification type is received.
    useEffect(() => {
        if (
            studyUuid &&
            voltageInitAvailabilityRef.current === OptionalServicesStatus.Up &&
            isComputationParametersUpdated(ComputingType.VOLTAGE_INITIALIZATION, studyUpdated)
        ) {
            fetchVoltageInitStudyParameters(studyUuid);
        }
    }, [studyUuid, fetchVoltageInitStudyParameters, studyUpdated]);

    return [voltageInitParams, setVoltageInitParams];
};
