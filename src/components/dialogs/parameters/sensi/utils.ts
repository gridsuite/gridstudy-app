/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CONTINGENCIES,
    HVDC_LINES,
    ID,
    NAME,
    PARAMETER_SENSI_HVDC,
    SENSITIVITY_TYPE,
    MONITORED_BRANCHES,
    CONTAINER_ID,
    CONTAINER_NAME,
    PARAMETER_SENSI_INJECTIONS_SET,
    DISTRIBUTION_TYPE,
    PARAMETER_SENSI_NODES,
    SUPERVISED_VOLTAGE_LEVELS,
    EQUIPMENTS_IN_VOLTAGE_REGULATION,
    PARAMETER_SENSI_PST,
    PSTS,
    INJECTIONS,
    PARAMETER_SENSI_INJECTION,
    ACTIVATED,
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';

interface INewParamsPst {
    sensitivityPST: Array<{
        [MONITORED_BRANCHES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [PSTS]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [SENSITIVITY_TYPE]: string;
        [CONTINGENCIES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [ACTIVATED]: boolean;
    }>;
}

interface INewParamsNodes {
    sensitivityNodes: Array<{
        [SUPERVISED_VOLTAGE_LEVELS]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [EQUIPMENTS_IN_VOLTAGE_REGULATION]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [CONTINGENCIES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [ACTIVATED]: boolean;
    }>;
}

interface INewParamsHvdc {
    sensitivityHVDC: Array<{
        [MONITORED_BRANCHES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [HVDC_LINES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [SENSITIVITY_TYPE]: string;
        [CONTINGENCIES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [ACTIVATED]: boolean;
    }>;
}

interface INewParamsInjections {
    sensitivityInjection: Array<{
        [MONITORED_BRANCHES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [INJECTIONS]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [CONTINGENCIES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [ACTIVATED]: boolean;
    }>;
}

export const getSensiHVDCsFormSchema = () => ({
    [PARAMETER_SENSI_HVDC]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .required()
                .when([ACTIVATED], {
                    is: (activated: boolean) => activated,
                    then: (schema) => schema.min(1, 'FieldIsRequired'),
                }),
            [SENSITIVITY_TYPE]: yup.string().when([ACTIVATED], {
                is: (activated: boolean) => activated,
                then: (schema) => schema.required(),
            }),
            [HVDC_LINES]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .required()
                .when([ACTIVATED], {
                    is: (activated: boolean) => activated,
                    then: (schema) => schema.min(1, 'FieldIsRequired'),
                }),
            [CONTINGENCIES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),

            [ACTIVATED]: yup.boolean().required(),
        })
    ),
});

export const getSensiHvdcformatNewParams = (newParams: INewParamsHvdc) => {
    return {
        [PARAMETER_SENSI_HVDC]: newParams.sensitivityHVDC.map((sensitivityHVDCs) => {
            return {
                [MONITORED_BRANCHES]: sensitivityHVDCs[MONITORED_BRANCHES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [HVDC_LINES]: sensitivityHVDCs[HVDC_LINES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [SENSITIVITY_TYPE]: sensitivityHVDCs[SENSITIVITY_TYPE],
                [CONTINGENCIES]: sensitivityHVDCs[CONTINGENCIES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [ACTIVATED]: sensitivityHVDCs[ACTIVATED],
            };
        }),
    };
};

export const getSensiInjectionsFormSchema = () => ({
    [PARAMETER_SENSI_INJECTION]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .required()
                .when([ACTIVATED], {
                    is: (activated: boolean) => activated,
                    then: (schema) => schema.min(1, 'FieldIsRequired'),
                }),
            [INJECTIONS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .required()
                .when([ACTIVATED], {
                    is: (activated: boolean) => activated,
                    then: (schema) => schema.min(1, 'FieldIsRequired'),
                }),
            [CONTINGENCIES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [ACTIVATED]: yup.boolean().required(),
        })
    ),
});

export const getSensiInjectionsformatNewParams = (newParams: INewParamsInjections) => {
    return {
        [PARAMETER_SENSI_INJECTION]: newParams.sensitivityInjection.map((sensitivityInjections) => {
            return {
                [MONITORED_BRANCHES]: sensitivityInjections[MONITORED_BRANCHES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [INJECTIONS]: sensitivityInjections[INJECTIONS].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [CONTINGENCIES]: sensitivityInjections[CONTINGENCIES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [ACTIVATED]: sensitivityInjections[ACTIVATED],
            };
        }),
    };
};

export const getSensiInjectionsSetFormSchema = () => ({
    [PARAMETER_SENSI_INJECTIONS_SET]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .required()
                .when([ACTIVATED], {
                    is: (activated: boolean) => activated,
                    then: (schema) => schema.min(1, 'FieldIsRequired'),
                }),
            [INJECTIONS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .required()
                .when([ACTIVATED], {
                    is: (activated: boolean) => activated,
                    then: (schema) => schema.min(1, 'FieldIsRequired'),
                }),
            [DISTRIBUTION_TYPE]: yup.string().when([ACTIVATED], {
                is: (activated: boolean) => activated,
                then: (schema) => schema.required(),
            }),
            [CONTINGENCIES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [ACTIVATED]: yup.boolean().nullable(),
        })
    ),
});

interface INewParamsInjectionsSet {
    sensitivityInjectionsSet: Array<{
        [MONITORED_BRANCHES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [INJECTIONS]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [DISTRIBUTION_TYPE]: string;
        [CONTINGENCIES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [ACTIVATED]: boolean;
    }>;
}

interface IRowNewParams {
    [MONITORED_BRANCHES]: Array<{
        [ID]: string;
        [NAME]: string;
    }>;
    [INJECTIONS]: Array<{
        [ID]: string;
        [NAME]: string;
    }>;
    [HVDC_LINES]: Array<{
        [ID]: string;
        [NAME]: string;
    }>;
    [PSTS]: Array<{
        [ID]: string;
        [NAME]: string;
    }>;
    [CONTINGENCIES]: Array<{
        [ID]: string;
        [NAME]: string;
    }>;
}

export const getGenericRowNewParams = (newRowParams: IRowNewParams) => {
    return {
        [MONITORED_BRANCHES]: newRowParams[MONITORED_BRANCHES].map((container) => container[ID]),
        [INJECTIONS]: newRowParams[INJECTIONS]?.map((container) => container[ID]),
        [HVDC_LINES]: newRowParams[HVDC_LINES]?.map((container) => container[ID]),
        [PSTS]: newRowParams[PSTS]?.map((container) => container[ID]),
        [CONTINGENCIES]: newRowParams[CONTINGENCIES]?.map((container) => container[ID]),
    };
};

export const getSensiInjectionsSetformatNewParams = (newParams: INewParamsInjectionsSet) => {
    return {
        [PARAMETER_SENSI_INJECTIONS_SET]: newParams.sensitivityInjectionsSet.map((sensitivityInjectionSet) => {
            return {
                [MONITORED_BRANCHES]: sensitivityInjectionSet[MONITORED_BRANCHES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [INJECTIONS]: sensitivityInjectionSet[INJECTIONS].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [DISTRIBUTION_TYPE]: sensitivityInjectionSet[DISTRIBUTION_TYPE],
                [CONTINGENCIES]: sensitivityInjectionSet[CONTINGENCIES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [ACTIVATED]: sensitivityInjectionSet[ACTIVATED],
            };
        }),
    };
};

export const getSensiNodesFormSchema = () => ({
    [PARAMETER_SENSI_NODES]: yup.array().of(
        yup.object().shape({
            [SUPERVISED_VOLTAGE_LEVELS]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [EQUIPMENTS_IN_VOLTAGE_REGULATION]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [CONTINGENCIES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [ACTIVATED]: yup.boolean().required(),
        })
    ),
});

export const getSensiNodesformatNewParams = (newParams: INewParamsNodes) => {
    return {
        [PARAMETER_SENSI_NODES]: newParams.sensitivityNodes?.map((sensitivityNode) => {
            return {
                [SUPERVISED_VOLTAGE_LEVELS]: sensitivityNode[SUPERVISED_VOLTAGE_LEVELS].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [EQUIPMENTS_IN_VOLTAGE_REGULATION]: sensitivityNode[EQUIPMENTS_IN_VOLTAGE_REGULATION].map(
                    (container) => {
                        return {
                            [CONTAINER_ID]: container[ID],
                            [CONTAINER_NAME]: container[NAME],
                        };
                    }
                ),
                [CONTINGENCIES]: sensitivityNode[CONTINGENCIES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [ACTIVATED]: sensitivityNode[ACTIVATED],
            };
        }),
    };
};

export const getSensiPSTsFormSchema = () => ({
    [PARAMETER_SENSI_PST]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .required()
                .when([ACTIVATED], {
                    is: (activated: boolean) => activated,
                    then: (schema) => schema.min(1, 'FieldIsRequired'),
                }),
            [SENSITIVITY_TYPE]: yup.string().when([ACTIVATED], {
                is: (activated: boolean) => activated,
                then: (schema) => schema.required(),
            }),
            [PSTS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .required()
                .when([ACTIVATED], {
                    is: (activated: boolean) => activated,
                    then: (schema) => schema.min(1, 'FieldIsRequired'),
                }),
            [CONTINGENCIES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [ACTIVATED]: yup.boolean().required(),
        })
    ),
});

export const getSensiPstformatNewParams = (newParams: INewParamsPst) => {
    return {
        [PARAMETER_SENSI_PST]: newParams.sensitivityPST.map((sensitivityPSTs) => {
            return {
                [MONITORED_BRANCHES]: sensitivityPSTs[MONITORED_BRANCHES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [PSTS]: sensitivityPSTs[PSTS].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [SENSITIVITY_TYPE]: sensitivityPSTs[SENSITIVITY_TYPE],
                [CONTINGENCIES]: sensitivityPSTs[CONTINGENCIES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [ACTIVATED]: sensitivityPSTs[ACTIVATED],
            };
        }),
    };
};
