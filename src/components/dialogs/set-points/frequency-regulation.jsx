/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GridItem, gridItemWithTooltip, percentageTextField } from '../dialog-utils';
import { useWatch } from 'react-hook-form';
import { DROOP, FREQUENCY_REGULATION } from 'components/utils/field-constants';
import React, { useMemo } from 'react';
import { FloatInput } from '@gridsuite/commons-ui';
import { SwitchInput } from '@gridsuite/commons-ui';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import CheckboxNullableInput from 'components/utils/rhf-inputs/boolean-nullable-input';
import { Box } from '@mui/material';

const FrequencyRegulation = ({ isEquipmentModification, previousValues }) => {
    const intl = useIntl();
    const watchFrequencyRegulation = useWatch({
        name: FREQUENCY_REGULATION,
    });

    const previousFrequencyRegulation = useMemo(() => {
        if (previousValues?.activePowerControl?.participate) {
            return intl.formatMessage({ id: 'On' });
        } else if (
            previousValues?.activePowerControl?.participate === false ||
            (previousValues && previousValues?.activePowerControl?.participate === undefined)
        ) {
            return intl.formatMessage({ id: 'Off' });
        }
    }, [intl, previousValues]);

    const frequencyRegulationField = isEquipmentModification ? (
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
            <SwitchInput name={FREQUENCY_REGULATION} label={'FrequencyRegulation'} />
        </Box>
    );

    const droopField = (
        <FloatInput
            name={DROOP}
            label={'Droop'}
            adornment={percentageTextField}
            previousValue={
                !isNaN(previousValues?.activePowerControl?.droop) ? previousValues?.activePowerControl?.droop : null
            }
            clearable={true}
        />
    );

    return (
        <>
            {isEquipmentModification
                ? gridItemWithTooltip(
                      frequencyRegulationField,
                      watchFrequencyRegulation !== null ? '' : <FormattedMessage id={'NoModification'} />,
                      4
                  )
                : GridItem(frequencyRegulationField, 4)}
            {GridItem(droopField, 4)}
        </>
    );
};

FrequencyRegulation.propTypes = {
    isEquipmentModification: PropTypes.bool,
};

export default FrequencyRegulation;
