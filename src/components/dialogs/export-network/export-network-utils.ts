/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    DIRECTORY_ITEM,
    EXPORT_DESTINATION,
    EXPORT_FORMAT,
    EXPORT_PARAMETERS,
    FILE_NAME,
} from '../../utils/field-constants';
import yup from '../../utils/yup-config';
import { DESCRIPTION, MAX_CHAR_DESCRIPTION, Parameter } from '@gridsuite/commons-ui';
import { directoryItemSchema } from '../../utils/rhf-inputs/directory-item-input/directory-item-utils';

export enum ExportDestinationType {
    GRID_EXPLORE = 'gridExplore',
    MY_COMPUTER = 'myComputer',
}

export const separator = '/';

export const emptyObj = {};

export type ExportNetworkFormData = yup.InferType<typeof schema>;

export const schema = yup.object().shape({
    [FILE_NAME]: yup.string().required(),
    [EXPORT_DESTINATION]: yup.string().oneOf(Object.values(ExportDestinationType)).required(),
    [DESCRIPTION]: yup.string().max(MAX_CHAR_DESCRIPTION).optional(),
    [DIRECTORY_ITEM]: directoryItemSchema.nullable().when([EXPORT_DESTINATION], {
        is: ExportDestinationType.GRID_EXPLORE,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
    }),
    [EXPORT_FORMAT]: yup.string().required('exportStudyErrorMsg'),
    [EXPORT_PARAMETERS]: yup.object(),
});

export const emptyData = {
    [FILE_NAME]: '',
    [EXPORT_DESTINATION]: ExportDestinationType.GRID_EXPLORE,
    [DIRECTORY_ITEM]: null,
    [DESCRIPTION]: '',
    [EXPORT_FORMAT]: '',
    [EXPORT_PARAMETERS]: emptyObj,
};

const STRING_LIST = 'STRING_LIST';

// we check if the param is for extension, if it is, we select all possible values by default.
// the only way for the moment to check if the param is for extension, is by checking his type is name.
// TODO to be removed when extensions param default value corrected in backend to include all possible values
export function getDefaultValuesForExtensionsParameter(parameters: Parameter[]): Parameter[] {
    return parameters.map((parameter) => {
        if (
            parameter.type === STRING_LIST &&
            (parameter.name?.endsWith('included.extensions') || parameter.name?.endsWith('included-extensions'))
        ) {
            parameter.defaultValue = parameter.possibleValues;
        }
        return parameter;
    });
}
