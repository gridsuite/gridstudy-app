/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, memo } from 'react';
import {
    COMMON_PARAMETERS,
    SPECIFIC_PARAMETERS,
    TYPES,
    TRANSFORMER_VOLTAGE_CONTROL_ON,
    PHASE_SHIFTER_REGULATION_ON,
    DC,
    BALANCE_TYPE,
    COUNTRIES_TO_BALANCE,
    CONNECTED_COMPONENT_MODE,
    HVDC_AC_EMULATION,
    VOLTAGE_INIT_MODE,
    USE_REACTIVE_LIMITS,
    TWT_SPLIT_SHUNT_ADMITTANCE,
    READ_SLACK_BUS,
    WRITE_SLACK_BUS,
    DISTRIBUTED_SLACK,
    SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON,
    DC_USE_TRANSFORMER_RATIO,
    DC_POWER_FACTOR,
} from './load-flow-parameters-utils';
import { ParameterGroup } from '../widget';
import { useLoadFlowContext } from './load-flow-parameters-context';
import LoadFlowParameterField from './load-flow-parameter-field';

interface FieldToShow {
    name: string;
    type: string;
    description?: string;
    label?: string;
    possibleValues?: { id: string; label: string }[] | string[];
}

const basicParams: FieldToShow[] = [
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

const fieldsToShow: FieldToShow[] = [
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
    specificParams: FieldToShow[];
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
                    fieldsToShow.map((item) => (
                        <LoadFlowParameterField id={COMMON_PARAMETERS} {...item} key={item.name} />
                    ))}
            </ParameterGroup>
            <ParameterGroup
                label="showSpecificParameters"
                state={showSpecificLfParams}
                onClick={setShowSpecificLfParams}
                infoText={provider ?? ''}
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
