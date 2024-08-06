/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SWITCH_KINDS, SWITCH_KIND } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

export const getCreateSwitchesValidationSchema = (id = SWITCH_KINDS) => {
    return {
        [id]: yup.array().nullable().of(getSwitchTypeSchema()),
    };
};

const createSwitchesEmptyFormData = () => ({
    [SWITCH_KIND]: '',
});

export const getSwitchTypeSchema = () =>
    yup.object().shape({
        [SWITCH_KIND]: yup.string().nullable().required(),
    });

export const getCreateSwitchesEmptyFormData = (sectionCount, id = SWITCH_KINDS) => ({
    [id]: Array(sectionCount - 1).fill(createSwitchesEmptyFormData()),
});
