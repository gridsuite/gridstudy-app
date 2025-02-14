/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import yup from '../../../utils/yup-config';
import {
    DEFAULT_BOUNDS,
    DEFAULT_FIXED_BOUNDS,
    ESTIM_ALGO_TYPE,
    ESTIM_LOG_LEVEL,
    P_MAX,
    P_MIN,
    PRINCIPAL_OBSERVABLE_ZONE,
    Q_MAX,
    Q_MIN,
    QUALITY_PER_REGION,
    THRESHOLD_ACT_REDUNDANCY,
    THRESHOLD_ACT_TRANSIT,
    THRESHOLD_LOST_ACT_LOAD,
    THRESHOLD_LOST_ACT_PROD,
    THRESHOLD_LOST_REA_LOAD,
    THRESHOLD_LOST_REA_PROD,
    THRESHOLD_NB_CRITICAL_MEASURE,
    THRESHOLD_NB_INVALID_MEASURE,
    THRESHOLD_NB_ITER,
    THRESHOLD_NB_LOST_INJECTIONS,
    THRESHOLD_NB_LOST_TRANSITS,
    THRESHOLD_NB_OUT_BOUNDS_GAP,
    THRESHOLD_OBSERVABILITY_RATE,
    THRESHOLD_OUT_BOUNDS_GAP_P,
    THRESHOLD_OUT_BOUNDS_GAP_Q,
    THRESHOLD_OUT_BOUNDS_GAP_V,
    THRESHOLD_PER_VOLTAGE_LEVEL,
    THRESHOLD_REA_REDUNDANCY,
    THRESHOLD_REA_TRANSIT,
    VOLTAGE_LEVEL,
    WEIGHT_ACT_LOAD,
    WEIGHT_ACT_PROD,
    WEIGHT_ACT_TRANSIT,
    WEIGHT_IN,
    WEIGHT_REA_LOAD,
    WEIGHT_REA_PROD,
    WEIGHT_REA_TRANSIT,
    WEIGHT_V,
    WEIGHTS_PARAMETERS,
} from '../../../utils/field-constants';

export enum TabValue {
    GENERAL = 'general',
    WEIGHTS = 'weights',
    QUALITY = 'quality',
    LOADBOUNDS = 'loadBounds',
}

enum estimAlgoType {
    GAUSS_NEWTON_L2 = 'GAUSS_NEWTON_L2',
    LEVENBERG_MARQUARDT_L2 = 'LEVENBERG_MARQUARDT_L2',
    NONE = 'NONE',
}

export const estimAlgoTypeValues = [
    ...Object.values(estimAlgoType).map((algoType) => ({ id: algoType, label: algoType })),
];

enum estimLogLevel {
    PAS = 'PAS',
    EXPERT = 'EXPERT',
    DEBUG = 'DEBUG',
}

export const estimLogLevelValues = [
    ...Object.values(estimLogLevel).map((logLevel) => ({ id: logLevel, label: logLevel })),
];

export const weightsParametersFields = [
    WEIGHT_V,
    WEIGHT_ACT_TRANSIT,
    WEIGHT_REA_TRANSIT,
    WEIGHT_ACT_PROD,
    WEIGHT_REA_PROD,
    WEIGHT_ACT_LOAD,
    WEIGHT_REA_LOAD,
    WEIGHT_IN,
];

export const qualityParametersFields = [
    THRESHOLD_OUT_BOUNDS_GAP_V,
    THRESHOLD_OUT_BOUNDS_GAP_P,
    THRESHOLD_OUT_BOUNDS_GAP_Q,
    THRESHOLD_LOST_ACT_PROD,
    THRESHOLD_LOST_REA_PROD,
    THRESHOLD_LOST_ACT_LOAD,
    THRESHOLD_LOST_REA_LOAD,
    THRESHOLD_ACT_TRANSIT,
    THRESHOLD_REA_TRANSIT,
];

export const loadboundsParametersFields = [P_MIN, P_MAX, Q_MIN, Q_MAX];

const defaultVoltageLevels = [20, 45, 63, 90, 150, 225, 400];

const defaultWeightsParameters = {
    [WEIGHT_V]: null,
    [WEIGHT_ACT_TRANSIT]: null,
    [WEIGHT_REA_TRANSIT]: null,
    [WEIGHT_ACT_PROD]: null,
    [WEIGHT_REA_PROD]: null,
    [WEIGHT_ACT_LOAD]: null,
    [WEIGHT_REA_LOAD]: null,
    [WEIGHT_IN]: null,
};

const defaultQualityParameters = {
    [THRESHOLD_OUT_BOUNDS_GAP_V]: null,
    [THRESHOLD_OUT_BOUNDS_GAP_P]: null,
    [THRESHOLD_OUT_BOUNDS_GAP_Q]: null,
    [THRESHOLD_LOST_ACT_PROD]: null,
    [THRESHOLD_LOST_REA_PROD]: null,
    [THRESHOLD_LOST_ACT_LOAD]: null,
    [THRESHOLD_LOST_REA_LOAD]: null,
    [THRESHOLD_ACT_TRANSIT]: null,
    [THRESHOLD_REA_TRANSIT]: null,
};

const defaultLoadboundsParameters = {
    [P_MIN]: null,
    [P_MAX]: null,
    [Q_MIN]: null,
    [Q_MAX]: null,
};

type WeightsParameters = {
    voltageLevel: number;
    weightV: number | null;
    weightActTransit: number | null;
    weightReaTransit: number | null;
    weightActProd: number | null;
    weightReaProd: number | null;
    weightActLoad: number | null;
    weightReaLoad: number | null;
    weightIN: number | null;
};

type LoadBoundsDetailsParameters = {
    voltageLevel: number;
    pmin: number | null;
    pmax: number | null;
    qmin: number | null;
    qmax: number | null;
};

type ThresholdsPerVoltageLevel = {
    thresholdVoltageLevel: number;
    thresholdOutBoundsGapV: number | null;
    thresholdOutBoundsGapP: number | null;
    thresholdOutBoundsGapQ: number | null;
    thresholdLostActProd: number | null;
    thresholdLostReaProd: number | null;
    thresholdLostActLoad: number | null;
    thresholdLostReaLoad: number | null;
    thresholdActTransit: number | null;
    thresholdReaTransit: number | null;
};

type ThresholdsPerVoltageLevelForm = {
    voltageLevel: number;
    thresholdOutBoundsGapV: number | null;
    thresholdOutBoundsGapP: number | null;
    thresholdOutBoundsGapQ: number | null;
    thresholdLostActProd: number | null;
    thresholdLostReaProd: number | null;
    thresholdLostActLoad: number | null;
    thresholdLostReaLoad: number | null;
    thresholdActTransit: number | null;
    thresholdReaTransit: number | null;
};

export type StateEstimationParameters = {
    estimParameters: {
        principalObservableZone: boolean;
        estimAlgoType: string;
        estimLogLevel: string;
        weights: {
            weightsParameters: WeightsParameters[] | null;
        };
        quality: {
            thresholdObservabilityRate: number;
            thresholdActRedundancy: number;
            thresholdReaRedundancy: number;
            thresholdNbLostInjections: number;
            thresholdNbInvalidMeasure: number;
            thresholdNbCriticalMeasure: number;
            thresholdNbOutBoundsGap: number;
            thresholdNbIter: number;
            thresholdNbLostTransits: number;
            qualityPerRegion: boolean;
            thresholdsPerVoltageLevel: ThresholdsPerVoltageLevel[] | null;
        };
        loadBounds: {
            defaultBounds: LoadBoundsDetailsParameters[] | null;
            defaultFixedBounds: LoadBoundsDetailsParameters[] | null;
        };
    };
};

const ESTIM_PARAMETERS = 'estimParameters';

export const convertFromVoltageLevelCode = (code: number): number => {
    switch (code) {
        case 1:
            return 20;
        case 2:
            return 45;
        case 3:
            return 63;
        case 4:
            return 90;
        case 5:
            return 150;
        case 6:
            return 225;
        case 7:
            return 400;
        default:
            return -1;
    }
};

export const convertToVoltageLevelCode = (code: number): number => {
    switch (code) {
        case 20:
            return 1;
        case 45:
            return 2;
        case 63:
            return 3;
        case 90:
            return 4;
        case 150:
            return 5;
        case 225:
            return 6;
        case 400:
            return 7;
        default:
            return -1;
    }
};

type VoltageLevelEntry = {
    voltageLevel: number;
    [key: string]: any;
};

function filterVoltageLevelArray(arr: any[]): any[] {
    return !arr.every((obj) => Object.keys(obj).every((key) => key === 'voltageLevel' || obj[key] === null)) ? arr : [];
}

export const fromStateEstimationParametersFormToParamValues = (
    params: StateEstimationParametersForm
): StateEstimationParameters => {
    return {
        [ESTIM_PARAMETERS]: {
            ...params.general,
            [TabValue.WEIGHTS]: {
                [WEIGHTS_PARAMETERS]: filterVoltageLevelArray(
                    params.weights.weightsParameters?.map((weight) => ({
                        [VOLTAGE_LEVEL]: convertToVoltageLevelCode(weight.voltageLevel),
                        [WEIGHT_V]: weight.weightV,
                        [WEIGHT_ACT_TRANSIT]: weight.weightActTransit,
                        [WEIGHT_REA_TRANSIT]: weight.weightReaTransit,
                        [WEIGHT_ACT_PROD]: weight.weightActProd,
                        [WEIGHT_REA_PROD]: weight.weightReaProd,
                        [WEIGHT_ACT_LOAD]: weight.weightActLoad,
                        [WEIGHT_REA_LOAD]: weight.weightReaLoad,
                        [WEIGHT_IN]: weight.weightIN,
                    }))
                ),
            },
            [TabValue.QUALITY]: {
                thresholdObservabilityRate: params.quality.thresholdObservabilityRate,
                thresholdActRedundancy: params.quality.thresholdReaRedundancy,
                thresholdReaRedundancy: params.quality.thresholdActRedundancy,
                thresholdNbLostInjections: params.quality.thresholdNbLostTransits,
                thresholdNbInvalidMeasure: params.quality.thresholdNbInvalidMeasure,
                thresholdNbCriticalMeasure: params.quality.thresholdNbCriticalMeasure,
                thresholdNbOutBoundsGap: params.quality.thresholdNbOutBoundsGap,
                thresholdNbIter: params.quality.thresholdNbIter,
                thresholdNbLostTransits: params.quality.thresholdNbLostInjections,
                qualityPerRegion: params.quality.qualityPerRegion,
                thresholdsPerVoltageLevel: filterVoltageLevelArray(
                    params.quality.thresholdsPerVoltageLevel?.map((threshold) => ({
                        thresholdVoltageLevel: convertToVoltageLevelCode(threshold.voltageLevel),
                        thresholdOutBoundsGapV: threshold.thresholdOutBoundsGapV,
                        thresholdOutBoundsGapP: threshold.thresholdOutBoundsGapP,
                        thresholdOutBoundsGapQ: threshold.thresholdOutBoundsGapQ,
                        thresholdLostActProd: threshold.thresholdLostActProd,
                        thresholdLostReaProd: threshold.thresholdLostReaProd,
                        thresholdLostActLoad: threshold.thresholdLostActProd,
                        thresholdLostReaLoad: threshold.thresholdLostReaProd,
                        thresholdActTransit: threshold.thresholdActTransit,
                        thresholdReaTransit: threshold.thresholdReaTransit,
                    }))
                ),
            },
            [TabValue.LOADBOUNDS]: {
                [DEFAULT_BOUNDS]: filterVoltageLevelArray(
                    params.loadBounds.defaultBounds?.map((loadBound) => ({
                        [VOLTAGE_LEVEL]: convertToVoltageLevelCode(loadBound.voltageLevel),
                        [P_MIN]: loadBound.pmin,
                        [P_MAX]: loadBound.pmax,
                        [Q_MIN]: loadBound.qmin,
                        [Q_MAX]: loadBound.pmax,
                    }))
                ),
                [DEFAULT_FIXED_BOUNDS]: filterVoltageLevelArray(
                    params.loadBounds.defaultFixedBounds?.map((loadBound) => ({
                        [VOLTAGE_LEVEL]: convertToVoltageLevelCode(loadBound.voltageLevel),
                        [P_MIN]: loadBound.pmin,
                        [P_MAX]: loadBound.pmax,
                        [Q_MIN]: loadBound.qmin,
                        [Q_MAX]: loadBound.pmax,
                    }))
                ),
            },
        },
    };
};

export const fromStateEstimationParametersParamToFormValues = (
    values: StateEstimationParameters['estimParameters']
): any => {
    //In case weights aren't defined, we set a default array to allow for array initialisation
    let weightParameters: WeightsParameters[] | null =
        values.weights.weightsParameters?.map((weight) => ({
            [VOLTAGE_LEVEL]: convertFromVoltageLevelCode(weight.voltageLevel),
            [WEIGHT_V]: weight.weightV,
            [WEIGHT_ACT_TRANSIT]: weight.weightActTransit,
            [WEIGHT_REA_TRANSIT]: weight.weightReaTransit,
            [WEIGHT_ACT_PROD]: weight.weightActProd,
            [WEIGHT_REA_PROD]: weight.weightReaProd,
            [WEIGHT_ACT_LOAD]: weight.weightActLoad,
            [WEIGHT_REA_LOAD]: weight.weightReaLoad,
            [WEIGHT_IN]: weight.weightIN,
        })) ?? null;

    if (weightParameters?.length === 0) {
        weightParameters = defaultVoltageLevels.map((voltageLevel) => ({
            [VOLTAGE_LEVEL]: voltageLevel,
            ...defaultWeightsParameters,
        }));
    }

    //In case thresholds per voltage level aren't defined, we set a default array to allow for array initialisation
    let thresholdPerVoltageLevel: ThresholdsPerVoltageLevelForm[] | null =
        values.quality.thresholdsPerVoltageLevel?.map((threshold) => ({
            voltageLevel: convertFromVoltageLevelCode(threshold.thresholdVoltageLevel),
            thresholdOutBoundsGapV: threshold.thresholdOutBoundsGapV,
            thresholdOutBoundsGapP: threshold.thresholdOutBoundsGapP,
            thresholdOutBoundsGapQ: threshold.thresholdOutBoundsGapQ,
            thresholdLostActProd: threshold.thresholdLostActProd,
            thresholdLostReaProd: threshold.thresholdLostReaProd,
            thresholdLostActLoad: threshold.thresholdLostActProd,
            thresholdLostReaLoad: threshold.thresholdLostReaProd,
            thresholdActTransit: threshold.thresholdActTransit,
            thresholdReaTransit: threshold.thresholdReaTransit,
        })) ?? null;

    if (thresholdPerVoltageLevel?.length === 0) {
        thresholdPerVoltageLevel = defaultVoltageLevels.map((voltageLevel) => ({
            [VOLTAGE_LEVEL]: voltageLevel,
            ...defaultQualityParameters,
        }));
    }

    let defaultBounds: LoadBoundsDetailsParameters[] | null =
        values.loadBounds.defaultBounds?.map((loadBound) => ({
            [VOLTAGE_LEVEL]: convertFromVoltageLevelCode(loadBound.voltageLevel),
            [P_MIN]: loadBound.pmin,
            [P_MAX]: loadBound.pmax,
            [Q_MIN]: loadBound.qmin,
            [Q_MAX]: loadBound.pmax,
        })) ?? null;

    if (defaultBounds?.length === 0) {
        defaultBounds = defaultVoltageLevels.map((voltageLevel) => ({
            [VOLTAGE_LEVEL]: voltageLevel,
            ...defaultLoadboundsParameters,
        }));
    }

    let defaulFixedtBounds: LoadBoundsDetailsParameters[] | null =
        values.loadBounds.defaultFixedBounds?.map((loadBound) => ({
            [VOLTAGE_LEVEL]: convertFromVoltageLevelCode(loadBound.voltageLevel),
            [P_MIN]: loadBound.pmin,
            [P_MAX]: loadBound.pmax,
            [Q_MIN]: loadBound.qmin,
            [Q_MAX]: loadBound.pmax,
        })) ?? null;

    if (defaulFixedtBounds?.length === 0) {
        defaulFixedtBounds = defaultVoltageLevels.map((voltageLevel) => ({
            [VOLTAGE_LEVEL]: voltageLevel,
            ...defaultLoadboundsParameters,
        }));
    }

    return {
        [TabValue.GENERAL]: {
            [PRINCIPAL_OBSERVABLE_ZONE]: values.principalObservableZone,
            [ESTIM_LOG_LEVEL]: values.estimLogLevel,
            [ESTIM_ALGO_TYPE]: values.estimAlgoType,
        },
        [TabValue.WEIGHTS]: {
            [WEIGHTS_PARAMETERS]: weightParameters,
        },
        [TabValue.QUALITY]: {
            [THRESHOLD_OBSERVABILITY_RATE]: values.quality.thresholdObservabilityRate,
            [THRESHOLD_ACT_REDUNDANCY]: values.quality.thresholdReaRedundancy,
            [THRESHOLD_REA_REDUNDANCY]: values.quality.thresholdActRedundancy,
            [THRESHOLD_NB_LOST_INJECTIONS]: values.quality.thresholdNbLostTransits,
            [THRESHOLD_NB_INVALID_MEASURE]: values.quality.thresholdNbInvalidMeasure,
            [THRESHOLD_NB_CRITICAL_MEASURE]: values.quality.thresholdNbCriticalMeasure,
            [THRESHOLD_NB_OUT_BOUNDS_GAP]: values.quality.thresholdNbOutBoundsGap,
            [THRESHOLD_NB_ITER]: values.quality.thresholdNbIter,
            [THRESHOLD_NB_LOST_TRANSITS]: values.quality.thresholdNbLostInjections,
            [QUALITY_PER_REGION]: values.quality.qualityPerRegion,
            [THRESHOLD_PER_VOLTAGE_LEVEL]: thresholdPerVoltageLevel,
        },
        [TabValue.LOADBOUNDS]: {
            [DEFAULT_BOUNDS]: defaultBounds,
            [DEFAULT_FIXED_BOUNDS]: defaulFixedtBounds,
        },
    };
};

export const stateEstimationParametersFormSchema = yup.object().shape({
    [TabValue.GENERAL]: yup.object().shape({
        [PRINCIPAL_OBSERVABLE_ZONE]: yup.boolean().required(),
        [ESTIM_ALGO_TYPE]: yup.string().required(),
        [ESTIM_LOG_LEVEL]: yup.string().required(),
    }),
    [TabValue.WEIGHTS]: yup.object().shape({
        [WEIGHTS_PARAMETERS]: yup
            .array()
            .of(
                yup.object().shape({
                    [VOLTAGE_LEVEL]: yup.number().required(),
                    [WEIGHT_V]: yup.number().nullable(),
                    [WEIGHT_ACT_TRANSIT]: yup.number().nullable(),
                    [WEIGHT_REA_TRANSIT]: yup.number().nullable(),
                    [WEIGHT_ACT_PROD]: yup.number().nullable(),
                    [WEIGHT_REA_PROD]: yup.number().nullable(),
                    [WEIGHT_ACT_LOAD]: yup.number().nullable(),
                    [WEIGHT_REA_LOAD]: yup.number().nullable(),
                    [WEIGHT_IN]: yup.number().nullable(),
                })
            )
            .nullable()
            .required(),
    }),
    [TabValue.QUALITY]: yup.object().shape({
        [THRESHOLD_OBSERVABILITY_RATE]: yup.number().required(),
        [THRESHOLD_ACT_REDUNDANCY]: yup.number().required(),
        [THRESHOLD_REA_REDUNDANCY]: yup.number().required(),
        [THRESHOLD_NB_LOST_INJECTIONS]: yup.number().required(),
        [THRESHOLD_NB_INVALID_MEASURE]: yup.number().required(),
        [THRESHOLD_NB_CRITICAL_MEASURE]: yup.number().required(),
        [THRESHOLD_NB_OUT_BOUNDS_GAP]: yup.number().required(),
        [THRESHOLD_NB_ITER]: yup.number().required(),
        [THRESHOLD_NB_LOST_TRANSITS]: yup.number().required(),
        [QUALITY_PER_REGION]: yup.boolean().required(),
        [THRESHOLD_PER_VOLTAGE_LEVEL]: yup
            .array()
            .of(
                yup.object().shape({
                    [VOLTAGE_LEVEL]: yup.number().required(),
                    [THRESHOLD_OUT_BOUNDS_GAP_V]: yup.number().nullable().required(),
                    [THRESHOLD_OUT_BOUNDS_GAP_P]: yup.number().nullable().required(),
                    [THRESHOLD_OUT_BOUNDS_GAP_Q]: yup.number().nullable().required(),
                    [THRESHOLD_LOST_ACT_PROD]: yup.number().nullable().required(),
                    [THRESHOLD_LOST_REA_PROD]: yup.number().nullable().required(),
                    [THRESHOLD_LOST_ACT_LOAD]: yup.number().nullable().required(),
                    [THRESHOLD_LOST_REA_LOAD]: yup.number().nullable().required(),
                    [THRESHOLD_ACT_TRANSIT]: yup.number().nullable().required(),
                    [THRESHOLD_REA_TRANSIT]: yup.number().nullable().required(),
                })
            )
            .nullable()
            .required(),
    }),
    [TabValue.LOADBOUNDS]: yup.object().shape({
        [DEFAULT_BOUNDS]: yup
            .array()
            .of(
                yup.object().shape({
                    [VOLTAGE_LEVEL]: yup.number().required(),
                    [P_MIN]: yup.number().nullable().required(),
                    [P_MAX]: yup.number().nullable().required(),
                    [Q_MIN]: yup.number().nullable().required(),
                    [Q_MAX]: yup.number().nullable().required(),
                })
            )
            .nullable()
            .required(),
        [DEFAULT_FIXED_BOUNDS]: yup
            .array()
            .of(
                yup.object().shape({
                    [VOLTAGE_LEVEL]: yup.number().required(),
                    [P_MIN]: yup.number().nullable().required(),
                    [P_MAX]: yup.number().nullable().required(),
                    [Q_MIN]: yup.number().nullable().required(),
                    [Q_MAX]: yup.number().nullable().required(),
                })
            )
            .nullable()
            .required(),
    }),
});

export type StateEstimationParametersForm = yup.InferType<typeof stateEstimationParametersFormSchema>;
