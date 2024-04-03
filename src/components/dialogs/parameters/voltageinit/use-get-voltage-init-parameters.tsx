/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { VoltageInitParam } from './voltage-init-utils';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../../redux/reducer.type';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useOptionalServiceStatus } from '../../../../hooks/use-optional-service-status';
import {
    OptionalServicesNames,
    OptionalServicesStatus,
} from '../../../utils/optional-services';
import { getVoltageInitStudyParameters } from '../../../../services/study/voltage-init';

export const useGetVoltageInitParameters = (): [
    VoltageInitParam | null,
    Dispatch<SetStateAction<VoltageInitParam | null>>
] => {
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [voltageInitParams, setVoltageInitParams] =
        useState<VoltageInitParam | null>(null);

    const voltageInitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.VoltageInit
    );

    useEffect(() => {
        if (
            studyUuid &&
            voltageInitAvailability === OptionalServicesStatus.Up
        ) {
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

    return [voltageInitParams, setVoltageInitParams];
};
