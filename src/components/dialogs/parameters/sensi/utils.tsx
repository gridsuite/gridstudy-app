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
    FILTER_ID,
    FILTER_NAME,
    PARAMETER_SENSI_INJECTIONS_SET,
    DISTRIBUTION_TYPE,
    PARAMETER_SENSI_NODES,
    SUPERVISED_VOLTAGE_LEVELS,
    EQUIPMENTS_IN_VOLTAGE_REGULATION,
    PARAMETER_SENSI_PST,
    PSTS,
    INJECTIONS,
    PARAMETER_SENSI_INJECTION,
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
    }>;
}

export const getSensiHVDCsFormSchema = () => ({
    [PARAMETER_SENSI_HVDC]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [SENSITIVITY_TYPE]: yup.string().nullable(),
            [HVDC_LINES]: yup.array().of(
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
        })
    ),
});

export const getSensiHvdcformatNewParams = (newParams: INewParamsHvdc) => {
    return {
        [PARAMETER_SENSI_HVDC]: newParams.sensitivityHVDC.map(
            (sensitivityInjection) => {
                return {
                    [MONITORED_BRANCHES]: sensitivityInjection[
                        MONITORED_BRANCHES
                    ].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [HVDC_LINES]: sensitivityInjection[HVDC_LINES].map(
                        (filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }
                    ),
                    [SENSITIVITY_TYPE]: sensitivityInjection[SENSITIVITY_TYPE],
                    [CONTINGENCIES]: sensitivityInjection[CONTINGENCIES].map(
                        (filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }
                    ),
                };
            }
        ),
    };
};

export const getSensiInjectionsFormSchema = () => ({
    [PARAMETER_SENSI_INJECTION]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [INJECTIONS]: yup.array().of(
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
        })
    ),
});

export const getSensiInjectionsformatNewParams = (
    newParams: INewParamsInjections
) => {
    return {
        [PARAMETER_SENSI_INJECTION]: newParams.sensitivityInjection.map(
            (sensitivityInjection) => {
                return {
                    [MONITORED_BRANCHES]: sensitivityInjection[
                        MONITORED_BRANCHES
                    ].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [INJECTIONS]: sensitivityInjection[INJECTIONS].map(
                        (filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }
                    ),
                    [CONTINGENCIES]: sensitivityInjection[CONTINGENCIES].map(
                        (filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }
                    ),
                };
            }
        ),
    };
};

export const getSensiInjectionsSetFormSchema = () => ({
    [PARAMETER_SENSI_INJECTIONS_SET]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [INJECTIONS]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [DISTRIBUTION_TYPE]: yup.string().nullable(),
            [CONTINGENCIES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
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
    }>;
}

export const getSensiInjectionsSetformatNewParams = (
    newParams: INewParamsInjectionsSet
) => {
    return {
        [PARAMETER_SENSI_INJECTIONS_SET]:
            newParams.sensitivityInjectionsSet.map(
                (sensitivityInjectionSet) => {
                    return {
                        [MONITORED_BRANCHES]: sensitivityInjectionSet[
                            MONITORED_BRANCHES
                        ].map((filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }),
                        [INJECTIONS]: sensitivityInjectionSet[INJECTIONS].map(
                            (filter) => {
                                return {
                                    [FILTER_ID]: filter[ID],
                                    [FILTER_NAME]: filter[NAME],
                                };
                            }
                        ),
                        [DISTRIBUTION_TYPE]:
                            sensitivityInjectionSet[DISTRIBUTION_TYPE],
                        [CONTINGENCIES]: sensitivityInjectionSet[
                            CONTINGENCIES
                        ].map((filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }),
                    };
                }
            ),
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
        })
    ),
});

export const getSensiNodesformatNewParams = (newParams: INewParamsNodes) => {
    return {
        [PARAMETER_SENSI_NODES]: newParams.sensitivityNodes.map(
            (sensitivityInjection) => {
                return {
                    [SUPERVISED_VOLTAGE_LEVELS]: sensitivityInjection[
                        SUPERVISED_VOLTAGE_LEVELS
                    ].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [EQUIPMENTS_IN_VOLTAGE_REGULATION]: sensitivityInjection[
                        EQUIPMENTS_IN_VOLTAGE_REGULATION
                    ].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [CONTINGENCIES]: sensitivityInjection[CONTINGENCIES].map(
                        (filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }
                    ),
                };
            }
        ),
    };
};

export const getSensiPSTsFormSchema = () => ({
    [PARAMETER_SENSI_PST]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [SENSITIVITY_TYPE]: yup.string().nullable(),
            [PSTS]: yup.array().of(
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
        })
    ),
});

export const getSensiPstformatNewParams = (newParams: INewParamsPst) => {
    return {
        [PARAMETER_SENSI_PST]: newParams.sensitivityPST.map(
            (sensitivityInjection) => {
                return {
                    [MONITORED_BRANCHES]: sensitivityInjection[
                        MONITORED_BRANCHES
                    ].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [PSTS]: sensitivityInjection[PSTS].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [SENSITIVITY_TYPE]: sensitivityInjection[SENSITIVITY_TYPE],
                    [CONTINGENCIES]: sensitivityInjection[CONTINGENCIES].map(
                        (filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }
                    ),
                };
            }
        ),
    };
};
