/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { VoltageInitParam } from './voltage-init-utils';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useOptionalServiceStatus } from '../../../../hooks/use-optional-service-status';
import { OptionalServicesNames, OptionalServicesStatus } from '../../../utils/optional-services';
import { getVoltageInitStudyParameters } from '../../../../services/study/voltage-init';
import { setStudyParamsChanged } from '../../../../redux/actions';
import { STUDY_PARAMS_CHANDED } from '../../../../utils/config-params';

export const useGetVoltageInitParameters = (): [
    VoltageInitParam | null,
    Dispatch<SetStateAction<VoltageInitParam | null>>
] => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const studyParamsChanged = useSelector((state: AppState) => state[STUDY_PARAMS_CHANDED]);
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const [voltageInitParams, setVoltageInitParams] = useState<VoltageInitParam | null>(null);

    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    useEffect(() => {
        if (studyUuid && voltageInitAvailability === OptionalServicesStatus.Up) {
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
        }
    }, [voltageInitAvailability, studyUuid, snackError]);

    useEffect(() => {
        console.log({ studyParamsChanged });

        if (
            studyUuid &&
            voltageInitAvailability === OptionalServicesStatus.Up &&
            studyParamsChanged === 'VoltageInit'
        ) {
            getVoltageInitStudyParameters(studyUuid)
                .then((params) => {
                    setVoltageInitParams(params);
                    dispatch(setStudyParamsChanged(''));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        }
    }, [studyUuid, snackError, dispatch, studyParamsChanged, setVoltageInitParams, voltageInitAvailability]);

    return [voltageInitParams, setVoltageInitParams];
};
