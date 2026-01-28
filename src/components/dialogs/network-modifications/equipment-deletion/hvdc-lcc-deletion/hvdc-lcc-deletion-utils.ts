/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../../utils/yup-config';
import {
    DELETION_SPECIFIC_TYPE,
    ID,
    SHUNT_COMPENSATOR_SELECTED,
    SHUNT_COMPENSATOR_SIDE_1,
    SHUNT_COMPENSATOR_SIDE_2,
} from '../../../../utils/field-constants';

const getMscConnectionsSchema = () =>
    yup
        .array()
        .of(
            yup.object().shape({
                [ID]: yup.string().required(),
                [SHUNT_COMPENSATOR_SELECTED]: yup.boolean().required(),
            })
        )
        .required();

export const getHvdcLccDeletionSchema = () =>
    yup
        .object()
        .shape({
            [DELETION_SPECIFIC_TYPE]: yup.string().required(),
            [SHUNT_COMPENSATOR_SIDE_1]: getMscConnectionsSchema(),
            [SHUNT_COMPENSATOR_SIDE_2]: getMscConnectionsSchema(),
        })
        .optional()
        .nullable();
