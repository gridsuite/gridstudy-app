/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LINE_TO_ATTACH_OR_SPLIT_ID } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import {
    getPercentageAreaData,
    getPercentageAreaEmptyFormData,
    getPercentageAreaValidationSchema,
} from '../../percentage-area/percentage-area-utils';

const lineToAttachOrSplitFormValidationSchema = () => ({
    [LINE_TO_ATTACH_OR_SPLIT_ID]: yup.string().nullable().required(),
    ...getPercentageAreaValidationSchema(),
});
export const getLineToAttachOrSplitFormValidationSchema = () => {
    return lineToAttachOrSplitFormValidationSchema();
};

const lineToAttachOrSplitEmptyFormData = () => ({
    [LINE_TO_ATTACH_OR_SPLIT_ID]: null,
    ...getPercentageAreaEmptyFormData(),
});

export const getLineToAttachOrSplitEmptyFormData = () => {
    return lineToAttachOrSplitEmptyFormData();
};

export const getLineToAttachOrSplitFormData = ({ lineToAttachOrSplitId, percent }) => {
    return {
        [LINE_TO_ATTACH_OR_SPLIT_ID]: lineToAttachOrSplitId,
        ...getPercentageAreaData({
            percent: percent,
        }),
    };
};
