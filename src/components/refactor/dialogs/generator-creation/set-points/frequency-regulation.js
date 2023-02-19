/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { gridItem, percentageTextField } from '../../../../dialogs/dialogUtils';
import { useWatch } from 'react-hook-form';
import { DROOP, FREQUENCY_REGULATION } from '../../../utils/field-constants';
import BooleanInput from '../../../rhf-inputs/boolean-input';
import React from 'react';
import FloatInput from '../../../rhf-inputs/float-input';
import yup from '../../../utils/yup-config';

export const FREQUENCY_REGULATION_EMPTY_FORM_DATA = {
    [FREQUENCY_REGULATION]: false,
    [DROOP]: null,
};

export const FREQUENCY_REGULATION_SCHEMA = yup.object().shape({
    [FREQUENCY_REGULATION]: yup.bool().required(),
    [DROOP]: yup
        .number()
        .nullable()
        .when([FREQUENCY_REGULATION], {
            is: true,
            then: (schema) => schema.required(),
        }),
});

const FrequencyRegulation = () => {
    const isFrequencyRegulationOn = useWatch({
        name: FREQUENCY_REGULATION,
    });

    const frequencyRegulationField = (
        <BooleanInput
            name={FREQUENCY_REGULATION}
            label={'FrequencyRegulation'}
        />
    );

    const droopField = (
        <FloatInput
            name={DROOP}
            label={'Droop'}
            adornment={percentageTextField}
        />
    );

    return (
        <>
            {gridItem(frequencyRegulationField, 4)}
            {isFrequencyRegulationOn && gridItem(droopField, 4)}
        </>
    );
};

export default FrequencyRegulation;
