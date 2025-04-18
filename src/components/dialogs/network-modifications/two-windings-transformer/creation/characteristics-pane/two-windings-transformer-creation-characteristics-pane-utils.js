/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CHARACTERISTICS, CONNECTIVITY_1, CONNECTIVITY_2 } from 'components/utils/field-constants';
import {
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../../connectivity/connectivity-form-utils';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsValidationSchema,
} from '../../characteristics-pane/two-windings-transformer-characteristics-pane-utils';

const twoWindingsTransformerValidationSchema = () =>
    getCharacteristicsValidationSchema(false, {
        ...getConnectivityWithPositionValidationSchema(false, CONNECTIVITY_1),
        ...getConnectivityWithPositionValidationSchema(false, CONNECTIVITY_2),
    });

export const getTwoWindingsTransformerValidationSchema = () => {
    return twoWindingsTransformerValidationSchema();
};

const twoWindingsTransformerEmptyFormData = () =>
    getCharacteristicsEmptyFormData({
        ...getConnectivityWithPositionEmptyFormData(false, CONNECTIVITY_1),
        ...getConnectivityWithPositionEmptyFormData(false, CONNECTIVITY_2),
    });

export const getTwoWindingsTransformerEmptyFormData = () => {
    return twoWindingsTransformerEmptyFormData();
};

export const getTwoWindingsTransformerFormData = (
    {
        r = null,
        x = null,
        g = null,
        b = null,
        ratedS = null,
        ratedU1 = null,
        ratedU2 = null,
        connectivity1 = null,
        connectivity2 = null,
    },
    id = CHARACTERISTICS
) =>
    getCharacteristicsFormData(
        {
            r,
            x,
            g,
            b,
            ratedS,
            ratedU1,
            ratedU2,
        },
        {
            [CONNECTIVITY_1]: connectivity1,
            [CONNECTIVITY_2]: connectivity2,
        }
    );
