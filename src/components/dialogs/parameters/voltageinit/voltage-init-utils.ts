/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    FILTERS,
    FILTER_ID,
    FILTER_NAME,
    FIXED_GENERATORS,
    HIGH_VOLTAGE_LIMIT,
    ID,
    LOW_VOLTAGE_LIMIT,
    NAME,
    PRIORITY,
    SELECTED,
    VARIABLE_SHUNT_COMPENSATORS,
    VARIABLE_TRANSFORMERS,
    VOLTAGE_LIMITS_DEFAULT,
    VOLTAGE_LIMITS_MODIFICATION,
} from 'components/utils/field-constants';
import { UUID } from 'crypto';
import {
    DEFAULT_GENERAL_APPLY_MODIFICATIONS,
    GENERAL,
    GENERAL_APPLY_MODIFICATIONS,
    TabValue,
    VoltageInitParametersForm,
} from './voltage-init-parameters-form';

export type Identifier = {
    [ID]: UUID | null;
    [NAME]: string | null;
};

type FilterIdentifier = {
    [FILTER_ID]: UUID;
    [FILTER_NAME]: string;
};

type VoltageLimitParam = {
    [FILTERS]: FilterIdentifier[];
    [LOW_VOLTAGE_LIMIT]: number;
    [HIGH_VOLTAGE_LIMIT]: number;
};

export type VoltageInitParam = {
    applyModifications: boolean;
    computationParameters: {
        [VOLTAGE_LIMITS_MODIFICATION]: VoltageLimitParam[];
        [VOLTAGE_LIMITS_DEFAULT]: VoltageLimitParam[];
        [FIXED_GENERATORS]: FilterIdentifier[];
        [VARIABLE_TRANSFORMERS]: FilterIdentifier[];
        [VARIABLE_SHUNT_COMPENSATORS]: FilterIdentifier[];
    };
};

export const fromVoltageInitParametersFormToParamValues = (
    newParams: VoltageInitParametersForm
): VoltageInitParam => {
    return {
        applyModifications:
            newParams?.[GENERAL]?.[GENERAL_APPLY_MODIFICATIONS] ??
            DEFAULT_GENERAL_APPLY_MODIFICATIONS,
        computationParameters: {
            [VOLTAGE_LIMITS_MODIFICATION]:
                newParams.voltageLimitsModification?.map((voltageLimit) => {
                    return {
                        [PRIORITY]:
                            newParams.voltageLimitsModification?.indexOf(
                                voltageLimit
                            ),
                        [LOW_VOLTAGE_LIMIT]:
                            voltageLimit[LOW_VOLTAGE_LIMIT] ?? 0,
                        [HIGH_VOLTAGE_LIMIT]:
                            voltageLimit[HIGH_VOLTAGE_LIMIT] ?? 0,
                        [FILTERS]:
                            voltageLimit[FILTERS]?.map((filter) => {
                                return {
                                    [FILTER_ID]: filter[ID] as UUID,
                                    [FILTER_NAME]: filter[NAME],
                                };
                            }) ?? [],
                    };
                }) ?? [],
            [VOLTAGE_LIMITS_DEFAULT]:
                newParams.voltageLimitsDefault?.map((voltageLimit) => {
                    return {
                        [PRIORITY]:
                            newParams.voltageLimitsDefault?.indexOf(
                                voltageLimit
                            ),
                        [LOW_VOLTAGE_LIMIT]:
                            voltageLimit[LOW_VOLTAGE_LIMIT] ?? 0,
                        [HIGH_VOLTAGE_LIMIT]:
                            voltageLimit[HIGH_VOLTAGE_LIMIT] ?? 0,
                        [FILTERS]:
                            voltageLimit[FILTERS]?.map((filter) => {
                                return {
                                    [FILTER_ID]: filter[ID] as UUID,
                                    [FILTER_NAME]: filter[NAME],
                                };
                            }) ?? [],
                    };
                }) ?? [],
            [FIXED_GENERATORS]:
                newParams[FIXED_GENERATORS]?.map((filter) => {
                    return {
                        [FILTER_ID]: filter[ID] as UUID,
                        [FILTER_NAME]: filter[NAME],
                    };
                }) ?? [],
            [VARIABLE_TRANSFORMERS]:
                newParams[VARIABLE_TRANSFORMERS]?.map((filter) => {
                    return {
                        [FILTER_ID]: filter[ID] as UUID,
                        [FILTER_NAME]: filter[NAME],
                    };
                }) ?? [],
            [VARIABLE_SHUNT_COMPENSATORS]:
                newParams[VARIABLE_SHUNT_COMPENSATORS]?.map((filter) => {
                    return {
                        [FILTER_ID]: filter[ID] as UUID,
                        [FILTER_NAME]: filter[NAME],
                    };
                }) ?? [],
        },
    };
};

export const fromVoltageInitParamsDataToFormValues = (
    parameters: VoltageInitParam['computationParameters']
): VoltageInitParametersForm => {
    return {
        [TabValue.GENERAL]: {
            [GENERAL_APPLY_MODIFICATIONS]: DEFAULT_GENERAL_APPLY_MODIFICATIONS,
        },
        [VOLTAGE_LIMITS_MODIFICATION]:
            parameters?.voltageLimitsModification?.map((voltageLimit) => {
                return {
                    // [SELECTED]: false,
                    [FILTERS]: voltageLimit[FILTERS]?.map((filter) => {
                        return {
                            [ID]: filter[FILTER_ID],
                            [NAME]: filter[FILTER_NAME],
                        };
                    }),
                    [LOW_VOLTAGE_LIMIT]: voltageLimit[LOW_VOLTAGE_LIMIT],
                    [HIGH_VOLTAGE_LIMIT]: voltageLimit[HIGH_VOLTAGE_LIMIT],
                };
            }) ?? [],
        [VOLTAGE_LIMITS_DEFAULT]:
            parameters?.voltageLimitsDefault?.map((voltageLimit) => {
                return {
                    [SELECTED]: false,
                    [FILTERS]: voltageLimit[FILTERS]?.map((filter) => {
                        return {
                            [ID]: filter[FILTER_ID],
                            [NAME]: filter[FILTER_NAME],
                        };
                    }),
                    [LOW_VOLTAGE_LIMIT]: voltageLimit[LOW_VOLTAGE_LIMIT],
                    [HIGH_VOLTAGE_LIMIT]: voltageLimit[HIGH_VOLTAGE_LIMIT],
                };
            }) ?? [],
        [FIXED_GENERATORS]: parameters?.[FIXED_GENERATORS]?.map((filter) => {
            return {
                [ID]: filter[FILTER_ID],
                [NAME]: filter[FILTER_NAME],
            };
        }),
        [VARIABLE_TRANSFORMERS]: parameters?.[VARIABLE_TRANSFORMERS]?.map(
            (filter) => {
                return {
                    [ID]: filter[FILTER_ID],
                    [NAME]: filter[FILTER_NAME],
                };
            }
        ),
        [VARIABLE_SHUNT_COMPENSATORS]: parameters?.[
            VARIABLE_SHUNT_COMPENSATORS
        ]?.map((filter) => {
            return {
                [ID]: filter[FILTER_ID],
                [NAME]: filter[FILTER_NAME],
            };
        }),
    };
};

export const fromStudyVoltageInitParamsDataToFormValues = (
    parameters: VoltageInitParam
): VoltageInitParametersForm => {
    return {
        [TabValue.GENERAL]: {
            [GENERAL_APPLY_MODIFICATIONS]: parameters.applyModifications,
        },
        [VOLTAGE_LIMITS_MODIFICATION]:
            parameters?.computationParameters?.voltageLimitsModification?.map(
                (voltageLimit) => {
                    return {
                        // [SELECTED]: false,
                        [FILTERS]: voltageLimit[FILTERS]?.map((filter) => {
                            return {
                                [ID]: filter[FILTER_ID],
                                [NAME]: filter[FILTER_NAME],
                            };
                        }),
                        [LOW_VOLTAGE_LIMIT]: voltageLimit[LOW_VOLTAGE_LIMIT],
                        [HIGH_VOLTAGE_LIMIT]: voltageLimit[HIGH_VOLTAGE_LIMIT],
                    };
                }
            ) ?? [],
        [VOLTAGE_LIMITS_DEFAULT]:
            parameters?.computationParameters?.voltageLimitsDefault?.map(
                (voltageLimit) => {
                    return {
                        [SELECTED]: false,
                        [FILTERS]: voltageLimit[FILTERS]?.map((filter) => {
                            return {
                                [ID]: filter[FILTER_ID],
                                [NAME]: filter[FILTER_NAME],
                            };
                        }),
                        [LOW_VOLTAGE_LIMIT]: voltageLimit[LOW_VOLTAGE_LIMIT],
                        [HIGH_VOLTAGE_LIMIT]: voltageLimit[HIGH_VOLTAGE_LIMIT],
                    };
                }
            ) ?? [],
        [FIXED_GENERATORS]: parameters?.computationParameters?.[
            FIXED_GENERATORS
        ]?.map((filter) => {
            return {
                [ID]: filter[FILTER_ID],
                [NAME]: filter[FILTER_NAME],
            };
        }),
        [VARIABLE_TRANSFORMERS]: parameters?.computationParameters?.[
            VARIABLE_TRANSFORMERS
        ]?.map((filter) => {
            return {
                [ID]: filter[FILTER_ID],
                [NAME]: filter[FILTER_NAME],
            };
        }),
        [VARIABLE_SHUNT_COMPENSATORS]: parameters?.computationParameters?.[
            VARIABLE_SHUNT_COMPENSATORS
        ]?.map((filter) => {
            return {
                [ID]: filter[FILTER_ID],
                [NAME]: filter[FILTER_NAME],
            };
        }),
    };
};
