/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { percentageTextField } from '../dialog-utils';
import { useWatch } from 'react-hook-form';
import { DROOP, FREQUENCY_REGULATION } from 'components/utils/field-constants';
import { useMemo } from 'react';
import { FloatInput, SwitchInput } from '@gridsuite/commons-ui';
import { FormattedMessage, useIntl } from 'react-intl';
import CheckboxNullableInput from 'components/utils/rhf-inputs/boolean-nullable-input';
import { Box } from '@mui/material';
import GridItem from '../commons/grid-item';
import { ActivePowerControlInfos } from './active-power-control.type';

export interface ActivePowerControlFormProps {
    isEquipmentModification?: boolean;
    previousValues?: ActivePowerControlInfos;
}

export function ActivePowerControlForm({
    isEquipmentModification = false,
    previousValues,
}: Readonly<ActivePowerControlFormProps>) {
    const intl = useIntl();
    const watchFrequencyRegulation = useWatch({
        name: FREQUENCY_REGULATION,
    });

    const previousFrequencyRegulation = useMemo(() => {
        if (previousValues?.participate) {
            return intl.formatMessage({ id: 'On' });
        } else if (
            previousValues?.participate === false ||
            (previousValues && previousValues?.participate === undefined)
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
            previousValue={Number.isNaN(previousValues?.droop) ? undefined : previousValues?.droop ?? undefined}
            clearable={true}
        />
    );

    return (
        <>
            {isEquipmentModification ? (
                <GridItem
                    tooltip={watchFrequencyRegulation !== null ? '' : <FormattedMessage id={'NoModification'} />}
                    size={4}
                >
                    {frequencyRegulationField}
                </GridItem>
            ) : (
                <GridItem size={4}>{frequencyRegulationField}</GridItem>
            )}
            <GridItem size={4}>{droopField}</GridItem>
        </>
    );
}
