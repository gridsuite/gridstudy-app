/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ElementType } from '@gridsuite/commons-ui';
import yup from '../../yup-config';
import { DIRECTORY_ITEM_FULL_PATH, DIRECTORY_ITEM_ID } from '../../field-constants';

export function getAbsenceLabelKeyFromType(elementType: string) {
    switch (elementType) {
        case ElementType.DIRECTORY:
            return 'NoFolder';
        case ElementType.CASE:
            return 'NoCase';
        case ElementType.STUDY:
            return 'NoStudy';
        default:
            return 'NoItem';
    }
}

export const directoryItemSchema = yup.object().shape({
    [DIRECTORY_ITEM_ID]: yup.string().required(),
    [DIRECTORY_ITEM_FULL_PATH]: yup.string().required(),
});

export type DirectoryItemSchema = yup.InferType<typeof directoryItemSchema>;
