/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const COMMON_PARAMETERS = 'commonParameters';
export const SPECIFIC_PARAMETERS = 'specificParametersPerProvider';

// BasicLoadFlowParameters
export const TRANSFORMER_VOLTAGE_CONTROL_ON = 'transformerVoltageControlOn';
export const PHASE_SHIFTER_REGULATION_ON = 'phaseShifterRegulationOn';
export const DC = 'dc';
export const BALANCE_TYPE = 'balanceType';
export const COUNTRIES_TO_BALANCE = 'countriesToBalance';
export const CONNECTED_COMPONENT_MODE = 'connectedComponentMode';
export const HVDC_AC_EMULATION = 'hvdcAcEmulation';

// AdvancedLoadFlowParameters
export const VOLTAGE_INIT_MODE = 'voltageInitMode';
export const USE_REACTIVE_LIMITS = 'useReactiveLimits';
export const TWT_SPLIT_SHUNT_ADMITTANCE = 'twtSplitShuntAdmittance';
export const READ_SLACK_BUS = 'readSlackBus';
export const WRITE_SLACK_BUS = 'writeSlackBus';
export const DISTRIBUTED_SLACK = 'distributedSlack';
export const SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON = 'shuntCompensatorVoltageControlOn';
export const DC_USE_TRANSFORMER_RATIO = 'dcUseTransformerRatio';
export const DC_POWER_FACTOR = 'dcPowerFactor';

export const MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION = 0.5;
export const MAX_VALUE_ALLOWED_FOR_LIMIT_REDUCTION = 1;
export const DEFAULT_LIMIT_REDUCTION_VALUE = 0.8;

export const alertThresholdMarks = [
    {
        value: MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION,
        label: '50',
    },
    {
        value: MAX_VALUE_ALLOWED_FOR_LIMIT_REDUCTION,
        label: '100',
    },
];
