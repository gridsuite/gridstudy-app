/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EquipmentType, yupConfig as yup } from '@gridsuite/commons-ui';
import {
    DESTINATION_FOLDER,
    EQUIPMENT_TYPE_FIELD,
    FOLDER_ID,
    FOLDER_NAME,
    NAME,
    SELECTION_TYPE,
} from 'components/utils/field-constants';
import { SELECTION_TYPES } from './selection-types';
import { UUID } from 'crypto';

export type DestinationFolder = {
    [FOLDER_ID]: UUID;
    [FOLDER_NAME]: string;
};

const formSchema = yup.object().shape({
    [SELECTION_TYPE]: yup.mixed<SELECTION_TYPES>().oneOf(Object.values(SELECTION_TYPES)).nullable().required(),
    [NAME]: yup.string().when([SELECTION_TYPE], {
        is: (value: SELECTION_TYPES) => value === SELECTION_TYPES.CONTIGENCY_LIST || value === SELECTION_TYPES.FILTER,
        then: (schema) => schema.required(),
    }),
    [EQUIPMENT_TYPE_FIELD]: yup
        .mixed<EquipmentType>()
        .oneOf(Object.values(EquipmentType))
        .nullable()
        .when([SELECTION_TYPE], {
            is: (value: SELECTION_TYPES) =>
                value === SELECTION_TYPES.CONTIGENCY_LIST || value === SELECTION_TYPES.FILTER,
            then: (schema) => schema.required(),
        }),
    [DESTINATION_FOLDER]: yup
        .object()
        .shape({
            [FOLDER_ID]: yup.mixed<UUID>().required(),
            [FOLDER_NAME]: yup.string().required(),
        })
        .nullable()
        .when([SELECTION_TYPE], {
            is: (value: SELECTION_TYPES) =>
                value === SELECTION_TYPES.CONTIGENCY_LIST || value === SELECTION_TYPES.FILTER,
            then: (schema) => schema.required(),
        }),
});

export const getSelectionCreationSchema = () => formSchema;

// used for useForm typing
export type SelectionCreationPanelFormSchema = yup.InferType<typeof formSchema>;

export type SelectionCreationPanelNadFields = SelectionCreationPanelFormSchema & {
    [SELECTION_TYPE]: SELECTION_TYPES.NAD;
};

export type SelectionCreationPanelNotNadFields = SelectionCreationPanelFormSchema & {
    [SELECTION_TYPE]: SELECTION_TYPES.CONTIGENCY_LIST | SELECTION_TYPES.FILTER;
    [NAME]: string;
    [EQUIPMENT_TYPE_FIELD]: EquipmentType;
    [DESTINATION_FOLDER]: {
        [FOLDER_ID]: UUID;
        [FOLDER_NAME]: string;
    };
};

// used for handleSubmit typing -> makes type discrimination possible
export type SelectionCreationPaneFields = SelectionCreationPanelNadFields | SelectionCreationPanelNotNadFields;
