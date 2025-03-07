/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import yup from '../../../utils/yup-config';
import { PROVIDER } from '../../../utils/field-constants';
import {
    curveFormSchema,
    mappingFormSchema,
    networkFormSchema,
    solverFormSchema,
    timeDelayFormSchema,
} from './dynamic-simulation-utils';

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

export const formSchema = yup.object().shape({
    [PROVIDER]: yup.string().required(),
    [TAB_VALUES.TIME_DELAY]: timeDelayFormSchema,
    [TAB_VALUES.SOLVER]: solverFormSchema,
    [TAB_VALUES.MAPPING]: mappingFormSchema,
    [TAB_VALUES.NETWORK]: networkFormSchema,
    [TAB_VALUES.CURVE]: curveFormSchema,
});

export type DynamicSimulationForm = yup.InferType<typeof formSchema>;
