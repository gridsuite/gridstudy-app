/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ESTIM_ALGO_TYPE,
    ESTIM_LOG_LEVEL,
    PRINCIPAL_OBSERVABLE_ZONE,
    UNIQUE_PHASE,
} from 'components/utils/field-constants';
import { estimAlgoTypeValues, estimLogLevelValues, TabValue } from './state-estimation-parameters-utils';
import { ParameterField, ParameterType, SpecificParameterInfos } from '@gridsuite/commons-ui';
import { memo } from 'react';

const basicParams: SpecificParameterInfos[] = [
    {
        name: PRINCIPAL_OBSERVABLE_ZONE,
        type: ParameterType.BOOLEAN,
        label: 'StateEstimationParametersPrincipalObservableZoneLabel',
    },
    {
        name: UNIQUE_PHASE,
        type: ParameterType.BOOLEAN,
        label: 'StateEstimationParametersUniquePhaseLabel',
    },
    {
        name: ESTIM_LOG_LEVEL,
        type: ParameterType.STRING,
        label: 'StateEstimationParametersLogLevelLabel',
        possibleValues: estimLogLevelValues,
    },
    {
        name: ESTIM_ALGO_TYPE,
        type: ParameterType.STRING,
        label: 'StateEstimationParametersAlgoTypeLabel',
        possibleValues: estimAlgoTypeValues,
    },
];

function StateEstimationGeneralParameters() {
    return (
        <>
            {basicParams.map((item) => (
                <ParameterField id={TabValue.GENERAL} {...item} key={item.name} />
            ))}
        </>
    );
}

export default memo(StateEstimationGeneralParameters);
