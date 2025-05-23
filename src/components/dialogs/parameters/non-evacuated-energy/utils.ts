/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { type Dispatch, type SetStateAction } from 'react';
import {
    ACTIVATED,
    BRANCHES,
    CONTAINER_ID,
    CONTAINER_NAME,
    CONTINGENCIES,
    GENERATION_STAGES_KIND,
    GENERATION_STAGES_PERCENT_MAXP_1,
    GENERATION_STAGES_PERCENT_MAXP_2,
    GENERATION_STAGES_PERCENT_MAXP_3,
    GENERATORS_CAPPINGS,
    GENERATORS_CAPPINGS_FILTER,
    GENERATORS_CAPPINGS_KIND,
    ID,
    MONITORED_BRANCHES,
    MONITORED_BRANCHES_COEFF_N,
    MONITORED_BRANCHES_COEFF_N_1,
    MONITORED_BRANCHES_IST_N,
    MONITORED_BRANCHES_IST_N_1,
    MONITORED_BRANCHES_LIMIT_NAME_N,
    MONITORED_BRANCHES_LIMIT_NAME_N_1,
    NAME,
    PMAX_PERCENTS,
    PMAX_PERCENTS_INDEX,
    PROVIDER,
    SENSITIVITY_THRESHOLD,
    STAGES_DEFINITION,
    STAGES_DEFINITION_GENERATORS,
    STAGES_DEFINITION_INDEX,
    STAGES_SELECTION,
} from '../../../utils/field-constants';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { EnergySource, type NonEvacuatedEnergyParametersInfos } from 'services/study/non-evacuated-energy.type';
import type { IntlShape } from 'react-intl';

export type UseGetNonEvacuatedEnergyParametersReturnProps = [
    NonEvacuatedEnergyParametersInfos | null,
    Dispatch<SetStateAction<NonEvacuatedEnergyParametersInfos | null>>,
];

function getGenerationStagesDefinitionFormSchema(intl: IntlShape) {
    return {
        [STAGES_DEFINITION]: yup.array().of(
            yup.object().shape({
                [GENERATION_STAGES_KIND]: yup.mixed<EnergySource>().oneOf(Object.values(EnergySource)).required(),
                [STAGES_DEFINITION_GENERATORS]: yup
                    .array()
                    .of(
                        yup.object().shape({
                            [ID]: yup.string().required(),
                            [NAME]: yup.string().required(),
                        })
                    )
                    .min(1, intl.formatMessage({ id: 'NoGeneratorsFilterGiven' })),
                [GENERATION_STAGES_PERCENT_MAXP_1]: yup
                    .number()
                    .min(0, intl.formatMessage({ id: 'NormalizedPercentage' }))
                    .max(100, intl.formatMessage({ id: 'NormalizedPercentage' }))
                    .required(),
                [GENERATION_STAGES_PERCENT_MAXP_2]: yup
                    .number()
                    .min(0, intl.formatMessage({ id: 'NormalizedPercentage' }))
                    .max(100, intl.formatMessage({ id: 'NormalizedPercentage' }))
                    .required(),
                [GENERATION_STAGES_PERCENT_MAXP_3]: yup
                    .number()
                    .min(0, intl.formatMessage({ id: 'NormalizedPercentage' }))
                    .max(100, intl.formatMessage({ id: 'NormalizedPercentage' }))
                    .required(),
            })
        ),
    };
}

export const getGenerationStagesDefinitionParams = (params: NonEvacuatedEnergyParametersForm) => {
    return {
        [STAGES_DEFINITION]: params[STAGES_DEFINITION]?.map((generationStage) => {
            return {
                [GENERATION_STAGES_KIND]: generationStage[GENERATION_STAGES_KIND],
                [STAGES_DEFINITION_GENERATORS]: generationStage[STAGES_DEFINITION_GENERATORS]?.map((container) => {
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

function getGenerationStagesSelectionFormSchema(intl: IntlShape) {
    return {
        [STAGES_SELECTION]: yup
            .array()
            .of(
                yup.object().shape({
                    [NAME]: yup.string().required(),
                    [STAGES_DEFINITION_INDEX]: yup.array().of(yup.number()),
                    [PMAX_PERCENTS_INDEX]: yup.array().of(yup.number()),
                    [ACTIVATED]: yup.boolean().required(),
                })
            )
            .min(1, intl.formatMessage({ id: 'NoSimulatedStageGiven' })),
    };
}

export const getGenerationStagesSelectionParams = (params: NonEvacuatedEnergyParametersForm) => {
    return {
        [STAGES_SELECTION]: params[STAGES_SELECTION]?.map((generationStageSelection) => ({
            [NAME]: generationStageSelection[NAME],
            [STAGES_DEFINITION_INDEX]: generationStageSelection[STAGES_DEFINITION_INDEX],
            [PMAX_PERCENTS_INDEX]: generationStageSelection[PMAX_PERCENTS_INDEX],
            [ACTIVATED]: generationStageSelection[ACTIVATED],
        })),
    };
};

function getGeneratorsCappingsFormSchema(intl: IntlShape) {
    return {
        [GENERATORS_CAPPINGS]: yup.object().shape({
            [SENSITIVITY_THRESHOLD]: yup
                .number()
                .min(0, intl.formatMessage({ id: 'CoefficientMustBeGreaterOrEqualToZero' }))
                .max(1, intl.formatMessage({ id: 'CoefficientMustBeLowerOrEqualToOne' }))
                .required(),
            [GENERATORS_CAPPINGS]: yup.array().of(
                yup.object().shape({
                    [GENERATORS_CAPPINGS_KIND]: yup.mixed<EnergySource>().oneOf(Object.values(EnergySource)).required(),
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
                            then: (schema) => schema.min(1, intl.formatMessage({ id: 'FieldIsRequired' })),
                        }),
                    [ACTIVATED]: yup.boolean().required(),
                })
            ),
        }),
    };
}

export const getGeneratorsCappingsParams = (
    sensitivityThreshold: number,
    params: NonEvacuatedEnergyParametersForm['generatorsCappings']
) => {
    return {
        [SENSITIVITY_THRESHOLD]: sensitivityThreshold,
        [GENERATORS_CAPPINGS_FILTER]: params[GENERATORS_CAPPINGS]?.map((generatorsCapping) => ({
            [GENERATORS_CAPPINGS_KIND]: generatorsCapping[GENERATORS_CAPPINGS_KIND],
            [GENERATORS_CAPPINGS_FILTER]: generatorsCapping[GENERATORS_CAPPINGS_FILTER].map((container) => ({
                [CONTAINER_ID]: container[ID],
                [CONTAINER_NAME]: container[NAME],
            })),
            [ACTIVATED]: generatorsCapping[ACTIVATED],
        })),
    };
};

function getMonitoredBranchesFormSchema(intl: IntlShape) {
    return {
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
                        then: (schema) => schema.min(1, intl.formatMessage({ id: 'FieldIsRequired' })),
                    }),
                [MONITORED_BRANCHES_IST_N]: yup.boolean().required(),
                [MONITORED_BRANCHES_LIMIT_NAME_N]: yup
                    .string()
                    .nullable()
                    .when([MONITORED_BRANCHES_IST_N, ACTIVATED], {
                        is: (istN: boolean, activated: boolean) => activated && !istN,
                        then: (schema) => schema.required(),
                    }),
                [MONITORED_BRANCHES_COEFF_N]: yup
                    .number()
                    .min(0, intl.formatMessage({ id: 'CoefficientMustBeGreaterOrEqualToZero' }))
                    .required(),
                [MONITORED_BRANCHES_IST_N_1]: yup.boolean().required(),
                [MONITORED_BRANCHES_LIMIT_NAME_N_1]: yup
                    .string()
                    .nullable()
                    .when([MONITORED_BRANCHES_IST_N_1, ACTIVATED], {
                        is: (istN1: boolean, activated: boolean) => activated && !istN1,
                        then: (schema) => schema.required(),
                    }),
                [MONITORED_BRANCHES_COEFF_N_1]: yup
                    .number()
                    .min(0, intl.formatMessage({ id: 'CoefficientMustBeGreaterOrEqualToZero' }))
                    .required(),
                [ACTIVATED]: yup.boolean().required(),
            })
        ),
    };
}

export const getMonitoredBranchesParams = (params: NonEvacuatedEnergyParametersForm) => {
    return {
        [MONITORED_BRANCHES]: params[MONITORED_BRANCHES]?.map((monitoredBranches) => ({
            [BRANCHES]: monitoredBranches[BRANCHES].map((container) => ({
                [CONTAINER_ID]: container[ID],
                [CONTAINER_NAME]: container[NAME],
            })),
            [MONITORED_BRANCHES_IST_N]: monitoredBranches[MONITORED_BRANCHES_IST_N],
            [MONITORED_BRANCHES_LIMIT_NAME_N]: monitoredBranches[MONITORED_BRANCHES_LIMIT_NAME_N],
            [MONITORED_BRANCHES_COEFF_N]: monitoredBranches[MONITORED_BRANCHES_COEFF_N],
            [MONITORED_BRANCHES_IST_N_1]: monitoredBranches[MONITORED_BRANCHES_IST_N_1],
            [MONITORED_BRANCHES_LIMIT_NAME_N_1]: monitoredBranches[MONITORED_BRANCHES_LIMIT_NAME_N_1],
            [MONITORED_BRANCHES_COEFF_N_1]: monitoredBranches[MONITORED_BRANCHES_COEFF_N_1],
            [ACTIVATED]: monitoredBranches[ACTIVATED],
        })),
    };
};

function getContingenciesFormSchema(intl: IntlShape) {
    return {
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
                        then: (schema) => schema.min(1, intl.formatMessage({ id: 'FieldIsRequired' })),
                    }),
                [ACTIVATED]: yup.boolean().required(),
            })
        ),
    };
}

export const getContingenciesParams = (params: NonEvacuatedEnergyParametersForm) => {
    return {
        [CONTINGENCIES]: params[CONTINGENCIES]?.map((contingencies) => ({
            [CONTINGENCIES]: contingencies[CONTINGENCIES].map((container) => ({
                [CONTAINER_ID]: container[ID],
                [CONTAINER_NAME]: container[NAME],
            })),
            [ACTIVATED]: contingencies[ACTIVATED],
        })),
    };
};

export function getFormSchema(intl: IntlShape) {
    return yup
        .object()
        .shape({
            [PROVIDER]: yup.string().required(),
            ...getGenerationStagesDefinitionFormSchema(intl),
            ...getGenerationStagesSelectionFormSchema(intl),
            ...getGeneratorsCappingsFormSchema(intl),
            ...getMonitoredBranchesFormSchema(intl),
            ...getContingenciesFormSchema(intl),
        })
        .required();
}

export type NonEvacuatedEnergyParametersForm = InferType<ReturnType<typeof getFormSchema>>;
