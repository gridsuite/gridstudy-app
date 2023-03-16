/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    gridItem,
    gridItemWithTooltip,
    percentageTextField,
} from '../../../../dialogs/dialogUtils';
import { useWatch } from 'react-hook-form';
import { DROOP, FREQUENCY_REGULATION } from '../../../utils/field-constants';
import React from 'react';
import FloatInput from '../../../rhf-inputs/float-input';
import SwitchInput from '../../../rhf-inputs/booleans/switch-input';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import CheckboxNullableInput from 'components/refactor/rhf-inputs/boolean-nullable-input';
import { Box } from '@mui/material';

const FrequencyRegulation = ({ isGeneratorModification, generatorInfos }) => {
    const intl = useIntl();
    const frequencyRegulation = useWatch({
        name: FREQUENCY_REGULATION,
    });

    const isFrequencyRegulationOn =
        frequencyRegulation === true ||
        (frequencyRegulation === null &&
            generatorInfos?.activePowerControlOn === true);

    let previousFrequencyRegulation = '';
    if (generatorInfos?.activePowerControlOn) {
        previousFrequencyRegulation = intl.formatMessage({ id: 'On' });
    } else if (
        generatorInfos?.activePowerControlOn === false ||
        (generatorInfos && generatorInfos.activePowerControlOn === undefined)
    ) {
        previousFrequencyRegulation = intl.formatMessage({ id: 'Off' });
    }

    const frequencyRegulationField = isGeneratorModification ? (
        <Box>
            <CheckboxNullableInput
                name={FREQUENCY_REGULATION}
                label={'FrequencyRegulation'}
                previousValue={previousFrequencyRegulation}
            />
        </Box>
    ) : (
        <SwitchInput
            name={FREQUENCY_REGULATION}
            label={'FrequencyRegulation'}
        />
    );

    const droopField = (
        <FloatInput
            name={DROOP}
            label={'Droop'}
            adornment={percentageTextField}
            previousValue={generatorInfos?.droop}
        />
    );

    return (
        <>
            {isGeneratorModification
                ? gridItemWithTooltip(
                      frequencyRegulationField,
                      frequencyRegulation !== null ? (
                          ''
                      ) : (
                          <FormattedMessage id={'NoModification'} />
                      ),
                      4
                  )
                : gridItem(frequencyRegulationField, 4)}
            {isFrequencyRegulationOn && gridItem(droopField, 4)}
        </>
    );
};

FrequencyRegulation.propTypes = {
    isGeneratorModification: PropTypes.bool,
};

export default FrequencyRegulation;
