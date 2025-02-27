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

interface VoltageLevelLabel {
    voltageLevel: string;
}

interface VoltageLevelCode {
    voltageLevel: number;
}

//Quality parameters has a dedicated label for data per voltage level
interface ThresholdVoltageLevelCode {
    thresholdVoltageLevel: number;
}

interface WeightsParameters extends VoltageLevelCode {
    weightV: number;
    weightActTransit: number;
    weightReaTransit: number;
    weightActProd: number;
    weightReaProd: number;
    weightActLoad: number;
    weightReaLoad: number;
    weightIN: number;
}

interface WeightParametersForm extends VoltageLevelLabel, Omit<WeightsParameters, 'voltageLevel'> {}

interface LoadBoundsDetailsParameters extends VoltageLevelCode {
    pmin: number;
    pmax: number;
    qmin: number;
    qmax: number;
}

interface LoadBoundsDetailsParametersForm
    extends VoltageLevelLabel,
        Omit<LoadBoundsDetailsParameters, 'voltageLevel'> {}

interface ThresholdsPerVoltageLevel extends ThresholdVoltageLevelCode {
    thresholdOutBoundsGapV: number;
    thresholdOutBoundsGapP: number;
    thresholdOutBoundsGapQ: number;
    thresholdLostActProd: number;
    thresholdLostReaProd: number;
    thresholdLostActLoad: number;
    thresholdLostReaLoad: number;
    thresholdActTransit: number;
    thresholdReaTransit: number;
}

interface ThresholdsPerVoltageLevelForm
    extends VoltageLevelLabel,
        Omit<ThresholdsPerVoltageLevel, 'thresholdVoltageLevel'> {}

export interface StateEstimationParameters {
    estimParameters: {
        principalObservableZone: boolean;
        estimAlgoType: string;
        estimLogLevel: string;
        weights: {
            weightsParameters: WeightsParameters[];
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
            thresholdsPerVoltageLevel: ThresholdsPerVoltageLevel[];
        };
        loadBounds: {
            defaultBounds: LoadBoundsDetailsParameters[];
            defaultFixedBounds: LoadBoundsDetailsParameters[];
        };
    };
}

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

export const fromStateEstimationParametersFormToParamValues = (
    params: StateEstimationParametersForm
): StateEstimationParameters => ({
    [ESTIM_PARAMETERS]: {
        ...params.general,
        [TabValue.WEIGHTS]: {
            [WEIGHTS_PARAMETERS]: params.weights.weightsParameters?.map((weight) => ({
                ...weight,
                [VOLTAGE_LEVEL]: mapToVoltageLevelCode(weight.voltageLevel),
            })),
        },
        [TabValue.QUALITY]: {
            ...params.quality,
            thresholdsPerVoltageLevel: params.quality.thresholdsPerVoltageLevel?.map((threshold) => ({
                ...threshold,
                thresholdVoltageLevel: mapToVoltageLevelCode(threshold.voltageLevel),
            })),
        },
        [TabValue.LOADBOUNDS]: {
            [DEFAULT_BOUNDS]: params.loadBounds.defaultBounds?.map((loadBound) => ({
                ...loadBound,
                [VOLTAGE_LEVEL]: mapToVoltageLevelCode(loadBound.voltageLevel),
            })),
            [DEFAULT_FIXED_BOUNDS]: params.loadBounds.defaultFixedBounds?.map((loadBound) => ({
                ...loadBound,
                [VOLTAGE_LEVEL]: mapToVoltageLevelCode(loadBound.voltageLevel),
            })),
        },
    },
});

const mapVoltageLevelData = <T extends VoltageLevelCode | ThresholdVoltageLevelCode, U extends VoltageLevelLabel>(
    items: T[]
): U[] =>
    items.map((item) => {
        const voltageLevelValue = 'thresholdVoltageLevel' in item ? item.thresholdVoltageLevel : item.voltageLevel;
        return {
            ...item,
            [VOLTAGE_LEVEL]: mapFromVoltageLevelCode(voltageLevelValue),
        } as unknown as U;
    });

export const fromStateEstimationParametersParamToFormValues = (
    values: StateEstimationParameters['estimParameters']
): StateEstimationParametersForm => ({
    [TabValue.GENERAL]: {
        [PRINCIPAL_OBSERVABLE_ZONE]: values.principalObservableZone,
        [ESTIM_LOG_LEVEL]: values.estimLogLevel,
        [ESTIM_ALGO_TYPE]: values.estimAlgoType,
    },
    [TabValue.WEIGHTS]: {
        [WEIGHTS_PARAMETERS]: mapVoltageLevelData<WeightsParameters, WeightParametersForm>(
            values.weights.weightsParameters
        ),
    },
    [TabValue.QUALITY]: {
        ...values.quality,
        [THRESHOLD_PER_VOLTAGE_LEVEL]: mapVoltageLevelData<ThresholdsPerVoltageLevel, ThresholdsPerVoltageLevelForm>(
            values.quality.thresholdsPerVoltageLevel
        ),
    },
    [TabValue.LOADBOUNDS]: {
        [DEFAULT_BOUNDS]: mapVoltageLevelData<LoadBoundsDetailsParameters, LoadBoundsDetailsParametersForm>(
            values.loadBounds.defaultBounds
        ),
        [DEFAULT_FIXED_BOUNDS]: mapVoltageLevelData<LoadBoundsDetailsParameters, LoadBoundsDetailsParametersForm>(
            values.loadBounds.defaultFixedBounds
        ),
    },
});

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
                    [WEIGHT_V]: yup.number().required().min(0).label(WEIGHT_V),
                    [WEIGHT_ACT_TRANSIT]: yup.number().required().max(0).label(WEIGHT_ACT_TRANSIT),
                    [WEIGHT_REA_TRANSIT]: yup.number().required().min(0).label(WEIGHT_REA_TRANSIT),
                    [WEIGHT_ACT_PROD]: yup.number().required().max(0).label(WEIGHT_ACT_PROD),
                    [WEIGHT_REA_PROD]: yup.number().required().min(0).label(WEIGHT_REA_PROD),
                    [WEIGHT_ACT_LOAD]: yup.number().required().max(0).label(WEIGHT_ACT_LOAD),
                    [WEIGHT_REA_LOAD]: yup.number().required().min(0).label(WEIGHT_REA_LOAD),
                    [WEIGHT_IN]: yup.number().required().min(0).label(WEIGHT_IN),
                })
            )
            .required(),
    }),
    [TabValue.QUALITY]: yup.object().shape({
        [THRESHOLD_OBSERVABILITY_RATE]: yup.number().required().min(0).label(THRESHOLD_OBSERVABILITY_RATE),
        [THRESHOLD_ACT_REDUNDANCY]: yup.number().required().min(0).label(THRESHOLD_ACT_REDUNDANCY),
        [THRESHOLD_REA_REDUNDANCY]: yup.number().required().min(0).label(THRESHOLD_REA_REDUNDANCY),
        [THRESHOLD_NB_LOST_INJECTIONS]: yup.number().required().min(0).label(THRESHOLD_NB_LOST_INJECTIONS),
        [THRESHOLD_NB_INVALID_MEASURE]: yup.number().required().min(0).label(THRESHOLD_NB_INVALID_MEASURE),
        [THRESHOLD_NB_CRITICAL_MEASURE]: yup.number().required().min(0).label(THRESHOLD_NB_CRITICAL_MEASURE),
        [THRESHOLD_NB_OUT_BOUNDS_GAP]: yup.number().required().min(0).label(THRESHOLD_NB_OUT_BOUNDS_GAP),
        [THRESHOLD_NB_ITER]: yup.number().required().min(0).label(THRESHOLD_NB_ITER),
        [THRESHOLD_NB_LOST_TRANSITS]: yup.number().required().min(0).label(THRESHOLD_NB_LOST_TRANSITS),
        [QUALITY_PER_REGION]: yup.boolean().required(),
        [THRESHOLD_PER_VOLTAGE_LEVEL]: yup
            .array()
            .of(
                yup.object().shape({
                    [VOLTAGE_LEVEL]: yup.string().required(),
                    [THRESHOLD_OUT_BOUNDS_GAP_V]: yup.number().required().min(0).label(THRESHOLD_OUT_BOUNDS_GAP_V),
                    [THRESHOLD_OUT_BOUNDS_GAP_P]: yup.number().required().min(0).label(THRESHOLD_OUT_BOUNDS_GAP_P),
                    [THRESHOLD_OUT_BOUNDS_GAP_Q]: yup.number().required().min(0).label(THRESHOLD_OUT_BOUNDS_GAP_Q),
                    [THRESHOLD_LOST_ACT_PROD]: yup.number().required().min(0).label(THRESHOLD_LOST_ACT_PROD),
                    [THRESHOLD_LOST_REA_PROD]: yup.number().required().min(0).label(THRESHOLD_LOST_REA_PROD),
                    [THRESHOLD_LOST_ACT_LOAD]: yup.number().required().min(0).label(THRESHOLD_LOST_ACT_LOAD),
                    [THRESHOLD_LOST_REA_LOAD]: yup.number().required().min(0).label(THRESHOLD_LOST_REA_LOAD),
                    [THRESHOLD_ACT_TRANSIT]: yup.number().required().min(0).label(THRESHOLD_ACT_TRANSIT),
                    [THRESHOLD_REA_TRANSIT]: yup.number().required().min(0).label(THRESHOLD_REA_TRANSIT),
                })
            )
            .required(),
    }),
    [TabValue.LOADBOUNDS]: yup.object().shape({
        [DEFAULT_BOUNDS]: yup
            .array()
            .of(
                yup.object().shape({
                    [VOLTAGE_LEVEL]: yup.string().required(),
                    [P_MIN]: yup.number().required(),
                    [P_MAX]: yup.number().required().min(0).label(P_MAX),
                    [Q_MIN]: yup.number().required(),
                    [Q_MAX]: yup.number().required(),
                })
            )
            .required(),
        [DEFAULT_FIXED_BOUNDS]: yup
            .array()
            .of(
                yup.object().shape({
                    [VOLTAGE_LEVEL]: yup.string().required(),
                    [P_MIN]: yup.number().required(),
                    [P_MAX]: yup.number().required().min(0).label(P_MAX),
                    [Q_MIN]: yup.number().required(),
                    [Q_MAX]: yup.number().required(),
                })
            )
            .required(),
    }),
});

export type StateEstimationParametersForm = yup.InferType<typeof stateEstimationParametersFormSchema>;
