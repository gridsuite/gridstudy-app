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

enum VoltageLevels {
    VL_20_KV = '20 kV',
    VL_45_KV = '45 kV',
    VL_63_KV = '63 kV',
    VL_90_KV = '90 kV',
    VL_150_KV = '150 kV',
    VL_225_KV = '225 kV',
    VL_400_KV = '400 kV',
}

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

const defaultVoltageLevels = [
    VoltageLevels.VL_20_KV,
    VoltageLevels.VL_45_KV,
    VoltageLevels.VL_63_KV,
    VoltageLevels.VL_90_KV,
    VoltageLevels.VL_150_KV,
    VoltageLevels.VL_225_KV,
    VoltageLevels.VL_400_KV,
];

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
    voltageLevel: number | string;
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
    voltageLevel: number | string;
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
    voltageLevel: number | string;
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

export const mapFromVoltageLevelCode = (code: number | string): string => {
    switch (code) {
        case 1:
            return VoltageLevels.VL_20_KV;
        case 2:
            return VoltageLevels.VL_45_KV;
        case 3:
            return VoltageLevels.VL_63_KV;
        case 4:
            return VoltageLevels.VL_90_KV;
        case 5:
            return VoltageLevels.VL_150_KV;
        case 6:
            return VoltageLevels.VL_225_KV;
        case 7:
            return VoltageLevels.VL_400_KV;
        default:
            return '';
    }
};

export const mapToVoltageLevelCode = (code: string): number => {
    switch (code) {
        case VoltageLevels.VL_20_KV:
            return 1;
        case VoltageLevels.VL_45_KV:
            return 2;
        case VoltageLevels.VL_63_KV:
            return 3;
        case VoltageLevels.VL_90_KV:
            return 4;
        case VoltageLevels.VL_150_KV:
            return 5;
        case VoltageLevels.VL_225_KV:
            return 6;
        case VoltageLevels.VL_400_KV:
            return 7;
        default:
            return -1;
    }
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
                        ...weight,
                        [VOLTAGE_LEVEL]: mapToVoltageLevelCode(weight.voltageLevel),
                    }))
                ),
            },
            [TabValue.QUALITY]: {
                ...params.quality,
                thresholdsPerVoltageLevel: filterVoltageLevelArray(
                    params.quality.thresholdsPerVoltageLevel?.map((threshold) => ({
                        ...threshold,
                        thresholdVoltageLevel: mapToVoltageLevelCode(threshold.voltageLevel),
                    }))
                ),
            },
            [TabValue.LOADBOUNDS]: {
                [DEFAULT_BOUNDS]: filterVoltageLevelArray(
                    params.loadBounds.defaultBounds?.map((loadBound) => ({
                        ...loadBound,
                        [VOLTAGE_LEVEL]: mapToVoltageLevelCode(loadBound.voltageLevel),
                    }))
                ),
                [DEFAULT_FIXED_BOUNDS]: filterVoltageLevelArray(
                    params.loadBounds.defaultFixedBounds?.map((loadBound) => ({
                        ...loadBound,
                        [VOLTAGE_LEVEL]: mapToVoltageLevelCode(loadBound.voltageLevel),
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
            ...weight,
            [VOLTAGE_LEVEL]: mapFromVoltageLevelCode(weight.voltageLevel),
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
            ...threshold,
            voltageLevel: mapFromVoltageLevelCode(threshold.thresholdVoltageLevel),
        })) ?? null;

    if (thresholdPerVoltageLevel?.length === 0) {
        thresholdPerVoltageLevel = defaultVoltageLevels.map((voltageLevel) => ({
            [VOLTAGE_LEVEL]: voltageLevel,
            ...defaultQualityParameters,
        }));
    }

    let defaultBounds: LoadBoundsDetailsParameters[] | null =
        values.loadBounds.defaultBounds?.map((loadBound) => ({
            ...loadBound,
            [VOLTAGE_LEVEL]: mapFromVoltageLevelCode(loadBound.voltageLevel),
        })) ?? null;

    if (defaultBounds?.length === 0) {
        defaultBounds = defaultVoltageLevels.map((voltageLevel) => ({
            [VOLTAGE_LEVEL]: voltageLevel,
            ...defaultLoadboundsParameters,
        }));
    }

    let defaulFixedBounds: LoadBoundsDetailsParameters[] | null =
        values.loadBounds.defaultFixedBounds?.map((loadBound) => ({
            ...loadBound,
            [VOLTAGE_LEVEL]: mapFromVoltageLevelCode(loadBound.voltageLevel),
        })) ?? null;

    if (defaulFixedBounds?.length === 0) {
        defaulFixedBounds = defaultVoltageLevels.map((voltageLevel) => ({
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
            ...values.quality,
            [THRESHOLD_PER_VOLTAGE_LEVEL]: thresholdPerVoltageLevel,
        },
        [TabValue.LOADBOUNDS]: {
            [DEFAULT_BOUNDS]: defaultBounds,
            [DEFAULT_FIXED_BOUNDS]: defaulFixedBounds,
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
                    [VOLTAGE_LEVEL]: yup.string().required(),
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
                    [VOLTAGE_LEVEL]: yup.string().required(),
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
                    [VOLTAGE_LEVEL]: yup.string().required(),
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
                    [VOLTAGE_LEVEL]: yup.string().required(),
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
