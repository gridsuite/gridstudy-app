/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { INITIAL_VOLTAGE, PREDEFINED_PARAMETERS, STATUS } from '../../../utils/constants';
import { Lens } from '@mui/icons-material';

import {
    SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE,
    SHORT_CIRCUIT_PREDEFINED_PARAMS,
    SHORT_CIRCUIT_WITH_FEEDER_RESULT,
    SHORT_CIRCUIT_WITH_LOADS,
    SHORT_CIRCUIT_WITH_NEUTRAL_POSITION,
    SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS,
    SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS,
} from '../../../utils/field-constants';
import { ShortCircuitParametersDto } from './short-circuit-parameters.type';

export const intlPredefinedParametersOptions = () => [
    {
        id: 'ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP',
        label: 'iccMawWithNominalVoltageMapPredefinedParams',
    },
    {
        id: 'ICC_MAX_WITH_CEI909',
        label: 'iccMaxWithCEIPredefinedParams',
    },
    {
        id: 'ICC_MIN_WITH_NOMINAL_VOLTAGE_MAP',
        label: 'iscMinWithNominalVoltageMapPredefinedParams',
    },
];

export const intlInitialVoltageProfileMode = () => {
    return {
        NOMINAL: {
            id: 'NOMINAL',
            label: 'nominalInitialVoltageProfileMode',
        },
        CEI909: {
            id: 'CEI909',
            label: 'cei909InitialVoltageProfileMode',
        },
    };
};

export const getStatus = (status: STATUS, styles: any) => {
    const color = status === STATUS.SUCCESS ? styles.succeed : styles.fail;
    return <Lens fontSize={'medium'} sx={color} />;
};

export const formatShortCircuitParameters = (
    parameters: ShortCircuitParametersDto,
    predefinedParameters: PREDEFINED_PARAMETERS
): Object => {
    return {
        [SHORT_CIRCUIT_WITH_FEEDER_RESULT]: parameters.withFeederResult,
        [SHORT_CIRCUIT_PREDEFINED_PARAMS]: predefinedParameters,
        [SHORT_CIRCUIT_WITH_LOADS]: parameters.withLoads,
        [SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS]: parameters.withVSCConverterStations,
        [SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS]: parameters.withShuntCompensators,
        [SHORT_CIRCUIT_WITH_NEUTRAL_POSITION]: !parameters.withNeutralPosition,
        [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]:
            parameters.initialVoltageProfileMode === INITIAL_VOLTAGE.CONFIGURED
                ? INITIAL_VOLTAGE.CEI909
                : parameters.initialVoltageProfileMode,
    };
};
