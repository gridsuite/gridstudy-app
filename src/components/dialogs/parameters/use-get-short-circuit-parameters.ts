/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { getShortCircuitParameters } from '../../../services/study/short-circuit-analysis';
import { OptionalServicesNames, OptionalServicesStatus } from '../../utils/optional-services';
import { useOptionalServiceStatus } from '../../../hooks/use-optional-service-status';
import ComputingType from '../../computing-status/computing-type';
import { isComputationParametersUpdated } from './common/computation-parameters-util';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import { ShortCircuitParametersInfos } from 'services/study/short-circuit-analysis.type';

export type UseGetShortCircuitParametersProps = [
    ShortCircuitParametersInfos | null,
    React.Dispatch<React.SetStateAction<ShortCircuitParametersInfos | null>>
];

export const useGetShortCircuitParameters = (): UseGetShortCircuitParametersProps => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const studyUpdated = useSelector((state: AppState) => state.studyUpdated);

    const { snackError } = useSnackMessage();
    const [shortCircuitParams, setShortCircuitParams] = useState<ShortCircuitParametersInfos | null>(null);

    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);

    const fetchShortCircuitParameters = useCallback(
        (studyUuid: UUID) => {
            getShortCircuitParameters(studyUuid)
                .then((params: ShortCircuitParametersInfos) => {
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

    // fetch the parameter if SHORT_CIRCUIT  notification type is received.
    useEffect(() => {
        if (
            studyUuid &&
            shortCircuitAvailability === OptionalServicesStatus.Up &&
            isComputationParametersUpdated(ComputingType.SHORT_CIRCUIT, studyUpdated)
        ) {
            fetchShortCircuitParameters(studyUuid);
        }
    }, [studyUuid, shortCircuitAvailability, fetchShortCircuitParameters, studyUpdated]);

    return [shortCircuitParams, setShortCircuitParams];
};
