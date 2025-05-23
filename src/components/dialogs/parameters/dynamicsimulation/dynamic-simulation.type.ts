/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as yup from 'yup';
import { type InferType } from 'yup';
import { PROVIDER } from '../../../utils/field-constants';
import {
    Curve,
    getIdaFormSchema,
    getSimplifiedFormSchema,
    MAPPING,
    NetworkEnum,
    Solver,
    TimeDelay,
} from './dynamic-simulation-utils';
import { SolverTypeInfos } from '../../../../services/study/dynamic-simulation.type';
import type { IntlShape } from 'react-intl';

export type ModelVariable = {
    id: string;
    name: string;
    parentId?: string;
    variableId?: string;
};

export enum TAB_VALUES {
    TIME_DELAY = 'timeDelay',
    SOLVER = 'solver',
    MAPPING = 'mapping',
    NETWORK = 'network',
    CURVE = 'curve',
}

export function getFormSchema(intl: IntlShape) {
    return yup.object().shape({
        [PROVIDER]: yup.string().required(),
        [TAB_VALUES.TIME_DELAY]: yup.object().shape({
            [TimeDelay.START_TIME]: yup.number().required(),
            [TimeDelay.STOP_TIME]: yup
                .number()
                .required()
                .when([TimeDelay.START_TIME], ([startTime], schema) =>
                    startTime
                        ? schema.min(
                              startTime,
                              intl.formatMessage({ id: 'DynamicSimulationStopTimeMustBeGreaterThanOrEqualToStartTime' })
                          )
                        : schema
                ),
        }),
        [TAB_VALUES.SOLVER]: yup.object().shape({
            [Solver.ID]: yup.string().required(),
            [Solver.SOLVERS]: yup.array().when([Solver.ID], ([solverId], schema) =>
                schema.of(
                    yup.lazy(({ id, type }) => {
                        // ignore validation if not current selected solver
                        if (solverId !== id) {
                            return yup.object().default(undefined);
                        }
                        // chose the right schema for each type of solver
                        if (type === SolverTypeInfos.IDA) {
                            return getIdaFormSchema();
                        } else {
                            return getSimplifiedFormSchema();
                        }
                    })
                )
            ),
        }),
        [TAB_VALUES.MAPPING]: yup.object().shape({
            [MAPPING]: yup.string().required(),
        }),
        [TAB_VALUES.NETWORK]: yup.object().shape({
            [NetworkEnum.CAPACITOR_NO_RECLOSING_DELAY]: yup.number().required(),
            [NetworkEnum.DANGLING_LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: yup.number().required(),
            [NetworkEnum.LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: yup.number().required(),
            [NetworkEnum.LOAD_TP]: yup.number().required(),
            [NetworkEnum.LOAD_TQ]: yup.number().required(),
            [NetworkEnum.LOAD_ALPHA]: yup.number().required(),
            [NetworkEnum.LOAD_ALPHA_LONG]: yup.number().required(),
            [NetworkEnum.LOAD_BETA]: yup.number().required(),
            [NetworkEnum.LOAD_BETA_LONG]: yup.number().required(),
            [NetworkEnum.LOAD_IS_CONTROLLABLE]: yup.boolean(),
            [NetworkEnum.LOAD_IS_RESTORATIVE]: yup.boolean(),
            [NetworkEnum.LOAD_Z_PMAX]: yup.number().required(),
            [NetworkEnum.LOAD_Z_QMAX]: yup.number().required(),
            [NetworkEnum.REACTANCE_NO_RECLOSING_DELAY]: yup.number().required(),
            [NetworkEnum.TRANSFORMER_CURRENT_LIMIT_MAX_TIME_OPERATION]: yup.number().required(),
            [NetworkEnum.TRANSFORMER_T1_ST_HT]: yup.number().required(),
            [NetworkEnum.TRANSFORMER_T1_ST_THT]: yup.number().required(),
            [NetworkEnum.TRANSFORMER_T_NEXT_HT]: yup.number().required(),
            [NetworkEnum.TRANSFORMER_T_NEXT_THT]: yup.number().required(),
            [NetworkEnum.TRANSFORMER_TO_LV]: yup.number().required(),
        }),
        [TAB_VALUES.CURVE]: yup.object().shape({
            [Curve.CURVES]: yup
                .array()
                .of(
                    yup.object().shape({
                        [Curve.EQUIPMENT_ID]: yup.string().required(),
                        [Curve.VARIABLE_ID]: yup.string().required(),
                    })
                )
                .nullable(),
        }),
    });
}

export type DynamicSimulationForm = InferType<ReturnType<typeof getFormSchema>>;
