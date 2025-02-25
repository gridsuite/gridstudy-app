/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getNonEvacuatedEnergyParameters } from '../../../../services/study/non-evacuated-energy';
import ComputingType from '../../../computing-status/computing-type';
import { isComputationParametersUpdated } from '../common/computation-parameters-util';
import { OptionalServicesNames, OptionalServicesStatus } from 'components/utils/optional-services';
import { useOptionalServiceStatus } from 'hooks/use-optional-service-status';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import { NonEvacuatedEnergyParametersInfos } from 'services/study/non-evacuated-energy.type';
import { UseGetNonEvacuatedEnergyParametersReturnProps } from './utils';

export const useGetNonEvacuatedEnergyParameters = (): UseGetNonEvacuatedEnergyParametersReturnProps => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const studyUpdated = useSelector((state: AppState) => state.studyUpdated);

    const { snackError } = useSnackMessage();
    const [nonEvacuatedEnergyParams, setNonEvacuatedEnergyParams] = useState<NonEvacuatedEnergyParametersInfos | null>(
        null
    );

    const nonEvacuatedEnergyAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const nonEvacuatedEnergyAvailabilityRef = useRef(nonEvacuatedEnergyAvailability);
    nonEvacuatedEnergyAvailabilityRef.current = nonEvacuatedEnergyAvailability;

    const fetchNonEvacuatedEnergyParameters = useCallback(
        (studyUuid: UUID) => {
            getNonEvacuatedEnergyParameters(studyUuid)
                .then((params: NonEvacuatedEnergyParametersInfos) => setNonEvacuatedEnergyParams(params))
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
        if (studyUuid && nonEvacuatedEnergyAvailability === OptionalServicesStatus.Up) {
            fetchNonEvacuatedEnergyParameters(studyUuid);
        }
    }, [nonEvacuatedEnergyAvailability, studyUuid, fetchNonEvacuatedEnergyParameters]);

    // fetch the parameter if NON_EVACUATED_ENERGY_ANALYSIS  notification type is received.
    useEffect(() => {
        if (
            studyUuid &&
            nonEvacuatedEnergyAvailabilityRef.current === OptionalServicesStatus.Up &&
            isComputationParametersUpdated(ComputingType.NON_EVACUATED_ENERGY_ANALYSIS, studyUpdated)
        ) {
            fetchNonEvacuatedEnergyParameters(studyUuid);
        }
    }, [studyUuid, fetchNonEvacuatedEnergyParameters, studyUpdated]);

    return [nonEvacuatedEnergyParams, setNonEvacuatedEnergyParams];
};
