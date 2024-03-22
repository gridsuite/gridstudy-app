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

export type Identifier = {
    [ID]: UUID | null;
    [NAME]: string | null;
};

type FilterIdentifier = {
    [FILTER_ID]: UUID | null;
    [FILTER_NAME]: string | null;
};

type VoltageLimitParam = {
    [FILTERS]: FilterIdentifier[];
    [LOW_VOLTAGE_LIMIT]: number;
    [HIGH_VOLTAGE_LIMIT]: number;
};

type VoltageLimitForm = {
    [FILTERS]: Identifier[];
    [LOW_VOLTAGE_LIMIT]: number;
    [HIGH_VOLTAGE_LIMIT]: number;
};

export type VoltageInitParam = {
    [VOLTAGE_LIMITS_MODIFICATION]: VoltageLimitParam[];
    [VOLTAGE_LIMITS_DEFAULT]: VoltageLimitParam[];
    [FIXED_GENERATORS]: FilterIdentifier[];
    [VARIABLE_TRANSFORMERS]: FilterIdentifier[];
    [VARIABLE_SHUNT_COMPENSATORS]: FilterIdentifier[];
};

export type VoltageInitForm = {
    [VOLTAGE_LIMITS_MODIFICATION]: VoltageLimitForm[];
    [VOLTAGE_LIMITS_DEFAULT]: VoltageLimitForm[];
    [FIXED_GENERATORS]: Identifier[];
    [VARIABLE_TRANSFORMERS]: Identifier[];
    [VARIABLE_SHUNT_COMPENSATORS]: Identifier[];
};

export const formatNewParams = (newParams: VoltageInitForm) => {
    return {
        [VOLTAGE_LIMITS_MODIFICATION]: newParams.voltageLimitsModification.map(
            (voltageLimit) => {
                return {
                    [PRIORITY]:
                        newParams.voltageLimitsModification.indexOf(
                            voltageLimit
                        ),
                    [LOW_VOLTAGE_LIMIT]: voltageLimit[LOW_VOLTAGE_LIMIT] ?? 0,
                    [HIGH_VOLTAGE_LIMIT]: voltageLimit[HIGH_VOLTAGE_LIMIT] ?? 0,
                    [FILTERS]: voltageLimit[FILTERS].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                };
            }
        ),
        [VOLTAGE_LIMITS_DEFAULT]: newParams.voltageLimitsDefault.map(
            (voltageLimit) => {
                return {
                    [PRIORITY]:
                        newParams.voltageLimitsDefault.indexOf(voltageLimit),
                    [LOW_VOLTAGE_LIMIT]: voltageLimit[LOW_VOLTAGE_LIMIT],
                    [HIGH_VOLTAGE_LIMIT]: voltageLimit[HIGH_VOLTAGE_LIMIT],
                    [FILTERS]: voltageLimit[FILTERS].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                };
            }
        ),
        [FIXED_GENERATORS]: newParams[FIXED_GENERATORS]?.map((filter) => {
            return {
                [FILTER_ID]: filter[ID],
                [FILTER_NAME]: filter[NAME],
            };
        }),
        [VARIABLE_TRANSFORMERS]: newParams[VARIABLE_TRANSFORMERS]?.map(
            (filter) => {
                return {
                    [FILTER_ID]: filter[ID],
                    [FILTER_NAME]: filter[NAME],
                };
            }
        ),
        [VARIABLE_SHUNT_COMPENSATORS]: newParams[
            VARIABLE_SHUNT_COMPENSATORS
        ]?.map((filter) => {
            return {
                [FILTER_ID]: filter[ID],
                [FILTER_NAME]: filter[NAME],
            };
        }),
    };
};

export const fromVoltageInitParamsDataToFormValues = (
    parameters: VoltageInitParam
) => {
    return {
        [VOLTAGE_LIMITS_MODIFICATION]:
            parameters.voltageLimitsModification?.map((voltageLimit) => {
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
        [VOLTAGE_LIMITS_DEFAULT]:
            parameters.voltageLimitsDefault?.map((voltageLimit) => {
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
        [FIXED_GENERATORS]: parameters[FIXED_GENERATORS]?.map((filter) => {
            return {
                [ID]: filter[FILTER_ID],
                [NAME]: filter[FILTER_NAME],
            };
        }),
        [VARIABLE_TRANSFORMERS]: parameters[VARIABLE_TRANSFORMERS]?.map(
            (filter) => {
                return {
                    [ID]: filter[FILTER_ID],
                    [NAME]: filter[FILTER_NAME],
                };
            }
        ),
        [VARIABLE_SHUNT_COMPENSATORS]: parameters[
            VARIABLE_SHUNT_COMPENSATORS
        ]?.map((filter) => {
            return {
                [ID]: filter[FILTER_ID],
                [NAME]: filter[FILTER_NAME],
            };
        }),
    };
};
