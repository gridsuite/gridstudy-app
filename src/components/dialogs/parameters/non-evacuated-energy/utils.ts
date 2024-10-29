/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CONTINGENCIES,
    ID,
    NAME,
    CONTAINER_ID,
    CONTAINER_NAME,
    ACTIVATED,
    GENERATION_STAGES_KIND,
    GENERATION_STAGES_PERCENT_MAXP_1,
    GENERATION_STAGES_PERCENT_MAXP_2,
    GENERATION_STAGES_PERCENT_MAXP_3,
    MONITORED_BRANCHES_IST_N,
    MONITORED_BRANCHES_IST_N_1,
    MONITORED_BRANCHES_LIMIT_NAME_N,
    MONITORED_BRANCHES_LIMIT_NAME_N_1,
    MONITORED_BRANCHES_COEFF_N,
    MONITORED_BRANCHES_COEFF_N_1,
    GENERATORS_CAPPINGS,
    GENERATORS_CAPPINGS_FILTER,
    GENERATORS_CAPPINGS_KIND,
    MONITORED_BRANCHES,
    BRANCHES,
    SENSITIVITY_THRESHOLD,
    STAGES_DEFINITION_INDEX,
    PMAX_PERCENTS_INDEX,
    STAGES_SELECTION,
    STAGES_DEFINITION,
    PMAX_PERCENTS,
    STAGES_DEFINITION_GENERATORS,
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';

interface IStagesDefinition {
    [STAGES_DEFINITION]: Array<{
        [STAGES_DEFINITION_GENERATORS]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [GENERATION_STAGES_KIND]: string;
        [GENERATION_STAGES_PERCENT_MAXP_1]: number;
        [GENERATION_STAGES_PERCENT_MAXP_2]: number;
        [GENERATION_STAGES_PERCENT_MAXP_3]: number;
    }>;
}

interface IStagesSelection {
    [STAGES_SELECTION]: Array<{
        [NAME]: string;
        [STAGES_DEFINITION_INDEX]: number[];
        [PMAX_PERCENTS_INDEX]: number[];
        [ACTIVATED]: boolean;
    }>;
}

interface IGeneratorsCappings {
    [SENSITIVITY_THRESHOLD]: number;
    [GENERATORS_CAPPINGS]: Array<{
        [GENERATORS_CAPPINGS_KIND]: string;
        [GENERATORS_CAPPINGS_FILTER]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [ACTIVATED]: boolean;
    }>;
}

interface IMonitoredBranches {
    [MONITORED_BRANCHES]: Array<{
        [BRANCHES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [MONITORED_BRANCHES_IST_N]: boolean;
        [MONITORED_BRANCHES_LIMIT_NAME_N]: string;
        [MONITORED_BRANCHES_COEFF_N]: number;
        [MONITORED_BRANCHES_IST_N_1]: boolean;
        [MONITORED_BRANCHES_LIMIT_NAME_N_1]: string;
        [MONITORED_BRANCHES_COEFF_N_1]: number;
        [ACTIVATED]: boolean;
    }>;
}

interface IContingencies {
    [CONTINGENCIES]: Array<{
        [CONTINGENCIES]: Array<{
            [ID]: string;
            [NAME]: string;
        }>;
        [ACTIVATED]: boolean;
    }>;
}

export const getGenerationStagesDefinitionFormSchema = () => ({
    [STAGES_DEFINITION]: yup.array().of(
        yup.object().shape({
            [GENERATION_STAGES_KIND]: yup.string().required(),
            [STAGES_DEFINITION_GENERATORS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .min(1, 'NoGeneratorsFilterGiven'),
            [GENERATION_STAGES_PERCENT_MAXP_1]: yup
                .number()
                .min(0, 'NormalizedPercentage')
                .max(100, 'NormalizedPercentage')
                .required(),
            [GENERATION_STAGES_PERCENT_MAXP_2]: yup
                .number()
                .min(0, 'NormalizedPercentage')
                .max(100, 'NormalizedPercentage')
                .required(),
            [GENERATION_STAGES_PERCENT_MAXP_3]: yup
                .number()
                .min(0, 'NormalizedPercentage')
                .max(100, 'NormalizedPercentage')
                .required(),
        })
    ),
});

export const getGenerationStagesDefinitionParams = (params: IStagesDefinition) => {
    return {
        [STAGES_DEFINITION]: params[STAGES_DEFINITION].map((generationStage) => {
            return {
                [GENERATION_STAGES_KIND]: generationStage[GENERATION_STAGES_KIND],
                [STAGES_DEFINITION_GENERATORS]: generationStage[STAGES_DEFINITION_GENERATORS].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [PMAX_PERCENTS]: [
                    generationStage[GENERATION_STAGES_PERCENT_MAXP_1],
                    generationStage[GENERATION_STAGES_PERCENT_MAXP_2],
                    generationStage[GENERATION_STAGES_PERCENT_MAXP_3],
                ],
            };
        }),
    };
};

export const getGenerationStagesSelectionFormSchema = () => ({
    [STAGES_SELECTION]: yup
        .array()
        .of(
            yup.object().shape({
                [NAME]: yup.string().required(),
                [ACTIVATED]: yup.boolean().required(),
            })
        )
        .min(1, 'NoSimulatedStageGiven'),
});

export const getGenerationStagesSelectionParams = (params: IStagesSelection) => {
    return {
        [STAGES_SELECTION]: params[STAGES_SELECTION].map((generationStageSelection) => {
            return {
                [NAME]: generationStageSelection[NAME],
                [STAGES_DEFINITION_INDEX]: generationStageSelection[STAGES_DEFINITION_INDEX],
                [PMAX_PERCENTS_INDEX]: generationStageSelection[PMAX_PERCENTS_INDEX],
                [ACTIVATED]: generationStageSelection[ACTIVATED],
            };
        }),
    };
};

export const getGeneratorsCappingsFormSchema = () => ({
    [GENERATORS_CAPPINGS]: yup.object().shape({
        [SENSITIVITY_THRESHOLD]: yup
            .number()
            .min(0, 'CoefficientMustBeGreaterOrEqualToZero')
            .max(1, 'CoefficientMustBeLowerOrEqualToOne')
            .required(),
        [GENERATORS_CAPPINGS]: yup.array().of(
            yup.object().shape({
                [GENERATORS_CAPPINGS_KIND]: yup.string().required(),
                [GENERATORS_CAPPINGS_FILTER]: yup
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
                [ACTIVATED]: yup.boolean().required(),
            })
        ),
    }),
});

export const getGeneratorsCappingsParams = (sensitivityThreshold: number, params: IGeneratorsCappings) => {
    return {
        [SENSITIVITY_THRESHOLD]: sensitivityThreshold,
        [GENERATORS_CAPPINGS_FILTER]: params[GENERATORS_CAPPINGS].map((generatorsCapping) => {
            return {
                [GENERATORS_CAPPINGS_KIND]: generatorsCapping[GENERATORS_CAPPINGS_KIND],
                [GENERATORS_CAPPINGS_FILTER]: generatorsCapping[GENERATORS_CAPPINGS_FILTER].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [ACTIVATED]: generatorsCapping[ACTIVATED],
            };
        }),
    };
};

export const getMonitoredBranchesFormSchema = () => ({
    [MONITORED_BRANCHES]: yup.array().of(
        yup.object().shape({
            [BRANCHES]: yup
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
            [MONITORED_BRANCHES_IST_N]: yup.boolean().required(),
            [MONITORED_BRANCHES_LIMIT_NAME_N]: yup
                .string()
                .nullable()
                .when([MONITORED_BRANCHES_IST_N, ACTIVATED], {
                    is: (istN: boolean, activated: boolean) => activated && !istN,
                    then: (schema) => schema.required(),
                }),
            [MONITORED_BRANCHES_COEFF_N]: yup.number().min(0, 'CoefficientMustBeGreaterOrEqualToZero').required(),
            [MONITORED_BRANCHES_IST_N_1]: yup.boolean().required(),
            [MONITORED_BRANCHES_LIMIT_NAME_N_1]: yup
                .string()
                .nullable()
                .when([MONITORED_BRANCHES_IST_N_1, ACTIVATED], {
                    is: (istN1: boolean, activated: boolean) => activated && !istN1,
                    then: (schema) => schema.required(),
                }),
            [MONITORED_BRANCHES_COEFF_N_1]: yup.number().min(0, 'CoefficientMustBeGreaterOrEqualToZero').required(),
            [ACTIVATED]: yup.boolean().required(),
        })
    ),
});

export const getMonitoredBranchesParams = (params: IMonitoredBranches) => {
    return {
        [MONITORED_BRANCHES]: params[MONITORED_BRANCHES].map((monitoredBranches) => {
            return {
                [BRANCHES]: monitoredBranches[BRANCHES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [MONITORED_BRANCHES_IST_N]: monitoredBranches[MONITORED_BRANCHES_IST_N],
                [MONITORED_BRANCHES_LIMIT_NAME_N]: monitoredBranches[MONITORED_BRANCHES_LIMIT_NAME_N],
                [MONITORED_BRANCHES_COEFF_N]: monitoredBranches[MONITORED_BRANCHES_COEFF_N],
                [MONITORED_BRANCHES_IST_N_1]: monitoredBranches[MONITORED_BRANCHES_IST_N_1],
                [MONITORED_BRANCHES_LIMIT_NAME_N_1]: monitoredBranches[MONITORED_BRANCHES_LIMIT_NAME_N_1],
                [MONITORED_BRANCHES_COEFF_N_1]: monitoredBranches[MONITORED_BRANCHES_COEFF_N_1],
                [ACTIVATED]: monitoredBranches[ACTIVATED],
            };
        }),
    };
};

export const getContingenciesFormSchema = () => ({
    [CONTINGENCIES]: yup.array().of(
        yup.object().shape({
            [CONTINGENCIES]: yup
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
            [ACTIVATED]: yup.boolean().required(),
        })
    ),
});

export const getContingenciesParams = (params: IContingencies) => {
    return {
        [CONTINGENCIES]: params[CONTINGENCIES].map((contingencies) => {
            return {
                [CONTINGENCIES]: contingencies[CONTINGENCIES].map((container) => {
                    return {
                        [CONTAINER_ID]: container[ID],
                        [CONTAINER_NAME]: container[NAME],
                    };
                }),
                [ACTIVATED]: contingencies[ACTIVATED],
            };
        }),
    };
};
