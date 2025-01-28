/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, memo } from 'react';
import { ParameterGroup } from '../widget';
import { useLoadFlowContext } from './load-flow-parameters-context';
import LoadFlowParameterField from './load-flow-parameter-field';
import {
    BALANCE_TYPE,
    COMMON_PARAMETERS,
    CONNECTED_COMPONENT_MODE,
    COUNTRIES_TO_BALANCE,
    DC,
    DC_POWER_FACTOR,
    DC_USE_TRANSFORMER_RATIO,
    DISTRIBUTED_SLACK,
    HVDC_AC_EMULATION,
    PHASE_SHIFTER_REGULATION_ON,
    READ_SLACK_BUS,
    SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON,
    SPECIFIC_PARAMETERS,
    TRANSFORMER_VOLTAGE_CONTROL_ON,
    TWT_SPLIT_SHUNT_ADMITTANCE,
    TYPES,
    USE_REACTIVE_LIMITS,
    VOLTAGE_INIT_MODE,
    WRITE_SLACK_BUS,
} from './constants';
import { ParameterDescription } from './load-flow-parameters-utils';

const basicParams: ParameterDescription[] = [
    {
        name: TRANSFORMER_VOLTAGE_CONTROL_ON,
        type: TYPES.BOOLEAN,
        label: 'descLfTransformerVoltageControlOn',
    },
    {
        name: PHASE_SHIFTER_REGULATION_ON,
        type: TYPES.BOOLEAN,
        label: 'descLfPhaseShifterRegulationOn',
    },
    {
        name: DC,
        type: TYPES.BOOLEAN,
        label: 'descLfDC',
    },
    {
        name: BALANCE_TYPE,
        type: TYPES.STRING,
        label: 'descLfBalanceType',
        possibleValues: [
            { id: 'PROPORTIONAL_TO_GENERATION_P', label: 'descLfBalanceTypeGenP' },
            { id: 'PROPORTIONAL_TO_GENERATION_P_MAX', label: 'descLfBalanceTypeGenPMax' },
            { id: 'PROPORTIONAL_TO_LOAD', label: 'descLfBalanceTypeLoad' },
            { id: 'PROPORTIONAL_TO_CONFORM_LOAD', label: 'descLfBalanceTypeConformLoad' },
        ],
    },
    {
        name: COUNTRIES_TO_BALANCE,
        type: TYPES.COUNTRIES,
        label: 'descLfCountriesToBalance',
    },
    {
        name: CONNECTED_COMPONENT_MODE,
        type: TYPES.STRING,
        label: 'descLfConnectedComponentMode',
        possibleValues: [
            {
                id: 'MAIN',
                label: 'descLfConnectedComponentModeMain',
            },
            {
                id: 'ALL',
                label: 'descLfConnectedComponentModeAll',
            },
        ],
    },
    {
        name: HVDC_AC_EMULATION,
        type: TYPES.BOOLEAN,
        label: 'descLfHvdcAcEmulation',
    },
];

const advancedParams: ParameterDescription[] = [
    {
        name: VOLTAGE_INIT_MODE,
        type: TYPES.STRING,
        label: 'descLfVoltageInitMode',
        possibleValues: [
            {
                id: 'UNIFORM_VALUES',
                label: 'descLfUniformValues',
            },
            {
                id: 'PREVIOUS_VALUES',
                label: 'descLfPreviousValues',
            },
            {
                id: 'DC_VALUES',
                label: 'descLfDcValues',
            },
        ],
    },
    {
        name: USE_REACTIVE_LIMITS,
        type: TYPES.BOOLEAN,
        label: 'descLfUseReactiveLimits',
    },
    {
        name: TWT_SPLIT_SHUNT_ADMITTANCE,
        type: TYPES.BOOLEAN,
        label: 'descLfTwtSplitShuntAdmittance',
    },
    {
        name: READ_SLACK_BUS,
        type: TYPES.BOOLEAN,
        label: 'descLfReadSlackBus',
    },
    {
        name: WRITE_SLACK_BUS,
        type: TYPES.BOOLEAN,
        label: 'descLfWriteSlackBus',
    },
    {
        name: DISTRIBUTED_SLACK,
        type: TYPES.BOOLEAN,
        label: 'descLfDistributedSlack',
    },
    {
        name: SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON,
        type: TYPES.BOOLEAN,
        label: 'descLfShuntCompensatorVoltageControlOn',
    },
    {
        name: DC_USE_TRANSFORMER_RATIO,
        type: TYPES.BOOLEAN,
        label: 'descLfDcUseTransformerRatio',
    },
    {
        name: DC_POWER_FACTOR,
        type: TYPES.DOUBLE,
        label: 'descLfDcPowerFactor',
    },
];

interface LoadFlowGeneralParametersProps {
    provider: string;
    specificParams: ParameterDescription[];
}

const LoadFlowGeneralParameters: FunctionComponent<LoadFlowGeneralParametersProps> = ({ provider, specificParams }) => {
    const { showAdvancedLfParams, setShowAdvancedLfParams, showSpecificLfParams, setShowSpecificLfParams } =
        useLoadFlowContext();
    return (
        <>
            {basicParams.map((item) => (
                <LoadFlowParameterField id={COMMON_PARAMETERS} {...item} key={item.name} />
            ))}
            <ParameterGroup
                label="showAdvancedParameters"
                state={showAdvancedLfParams}
                onClick={setShowAdvancedLfParams}
            >
                {showAdvancedLfParams &&
                    advancedParams.map((item) => (
                        <LoadFlowParameterField id={COMMON_PARAMETERS} {...item} key={item.name} />
                    ))}
            </ParameterGroup>
            <ParameterGroup
                label="showSpecificParameters"
                state={showSpecificLfParams}
                onClick={setShowSpecificLfParams}
                infoText={provider ?? ''}
                disabled={!provider || !specificParams}
            >
                {showSpecificLfParams &&
                    specificParams?.map((item) => (
                        <LoadFlowParameterField id={SPECIFIC_PARAMETERS} {...item} key={item.name} />
                    ))}
            </ParameterGroup>
        </>
    );
};

export default memo(LoadFlowGeneralParameters);
