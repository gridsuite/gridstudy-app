/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
} from 'components/utils/field-constants';
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
        ...getConnectivityWithPositionValidationSchema(CONNECTIVITY_1),
        ...getConnectivityWithPositionValidationSchema(CONNECTIVITY_2),
    });

export const getTwoWindingsTransformerValidationSchema = () => {
    return twoWindingsTransformerValidationSchema();
};

const twoWindingsTransformerEmptyFormData = () =>
    getCharacteristicsEmptyFormData({
        ...getConnectivityWithPositionEmptyFormData(CONNECTIVITY_1),
        ...getConnectivityWithPositionEmptyFormData(CONNECTIVITY_2),
    });

export const getTwoWindingsTransformerEmptyFormData = () => {
    return twoWindingsTransformerEmptyFormData();
};

export const getTwoWindingsTransformerFormData = (
    {
        seriesResistance = null,
        seriesReactance = null,
        magnetizingConductance = null,
        magnetizingSusceptance = null,
        ratedS = null,
        ratedVoltage1 = null,
        ratedVoltage2 = null,
        connectivity1 = null,
        connectivity2 = null,
    },
    id = CHARACTERISTICS
) =>
    getCharacteristicsFormData(
        {
            seriesResistance,
            seriesReactance,
            magnetizingConductance,
            magnetizingSusceptance,
            ratedS,
            ratedVoltage1,
            ratedVoltage2,
        },
        {
            [CONNECTIVITY_1]: connectivity1,
            [CONNECTIVITY_2]: connectivity2,
        }
    );
