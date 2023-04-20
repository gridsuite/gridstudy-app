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
import React, { useMemo } from 'react';
import FloatInput from '../../../rhf-inputs/float-input';
import SwitchInput from '../../../rhf-inputs/booleans/switch-input';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import CheckboxNullableInput from 'components/refactor/rhf-inputs/boolean-nullable-input';
import { Box } from '@mui/material';

const FrequencyRegulation = ({ isGeneratorModification, previousValues }) => {
    const intl = useIntl();
    const watchFrequencyRegulation = useWatch({
        name: FREQUENCY_REGULATION,
    });

    const isFrequencyRegulationOn = useMemo(
        () =>
            watchFrequencyRegulation === true ||
            (watchFrequencyRegulation === null &&
                previousValues?.activePowerControlOn === true),
        [watchFrequencyRegulation, previousValues?.activePowerControlOn]
    );

    const previousFrequencyRegulation = useMemo(() => {
        if (previousValues?.activePowerControlOn) {
            return intl.formatMessage({ id: 'On' });
        } else if (
            previousValues?.activePowerControlOn === false ||
            (previousValues &&
                previousValues?.activePowerControlOn === undefined)
        ) {
            return intl.formatMessage({ id: 'Off' });
        }
    }, [intl, previousValues]);

    const frequencyRegulationField = isGeneratorModification ? (
        /** wrappe with box to avoid warning */
        <Box>
            <CheckboxNullableInput
                name={FREQUENCY_REGULATION}
                label={'FrequencyRegulation'}
                previousValue={previousFrequencyRegulation}
            />
        </Box>
    ) : (
        <Box>
            <SwitchInput
                name={FREQUENCY_REGULATION}
                label={'FrequencyRegulation'}
            />
        </Box>
    );

    const droopField = (
        <FloatInput
            name={DROOP}
            label={'Droop'}
            adornment={percentageTextField}
            previousValue={previousValues?.droop}
            clearable={true}
        />
    );

    return (
        <>
            {isGeneratorModification
                ? gridItemWithTooltip(
                      frequencyRegulationField,
                      watchFrequencyRegulation !== null ? (
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
