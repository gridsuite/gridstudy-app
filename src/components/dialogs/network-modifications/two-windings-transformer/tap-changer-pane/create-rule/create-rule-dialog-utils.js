/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HIGH_TAP_POSITION, LOW_TAP_POSITION } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

const createRuleValidationSchema = () =>
    yup.object().shape({
        [LOW_TAP_POSITION]: yup.number().nullable().required(),
        [HIGH_TAP_POSITION]: yup.number().nullable().required(),
    });

export const getCreateRuleValidationSchema = () => createRuleValidationSchema();

const createRuleEmptyFormData = () => ({
    [LOW_TAP_POSITION]: null,
    [HIGH_TAP_POSITION]: null,
});

export const getCreateRuteEmptyFormData = () => createRuleEmptyFormData();
