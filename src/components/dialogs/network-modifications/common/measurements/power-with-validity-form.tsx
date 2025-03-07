/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { FunctionComponent, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { convertInputValue, FieldType, FloatInput } from '@gridsuite/commons-ui';
import { MeasurementProps } from './measurement.type';
import CheckboxNullableInput from '../../../../utils/rhf-inputs/boolean-nullable-input';
import GridItem from '../../../commons/grid-item';
import { VALIDITY, VALUE } from '../../../../utils/field-constants';
import { ActivePowerAdornment, ReactivePowerAdornment } from '../../../dialog-utils';

export const PowerWithValidityForm: FunctionComponent<MeasurementProps> = ({ id, field, measurement }) => {
    const intl = useIntl();

    const previousValidityField = useMemo(() => {
        if (measurement?.validity == null) {
            return '';
        }
        return measurement.validity
            ? intl.formatMessage({ id: 'ValidMeasurement' })
            : intl.formatMessage({ id: 'InvalidMeasurement' });
    }, [intl, measurement?.validity]);

    const valueField = (
        <FloatInput
            name={`${id}.${VALUE}`}
            label={field === FieldType.ACTIVE_POWER ? 'ActivePowerText' : 'ReactivePowerText'}
            adornment={field === FieldType.ACTIVE_POWER ? ActivePowerAdornment : ReactivePowerAdornment}
            previousValue={convertInputValue(field, measurement?.value)}
            clearable={true}
        />
    );

    const validityField = (
        <CheckboxNullableInput
            name={`${id}.${VALIDITY}`}
            label="ValidMeasurement"
            previousValue={previousValidityField}
        />
    );

    return (
        <Grid container spacing={2}>
            <GridItem size={6}>{valueField}</GridItem>
            <GridItem size={6}>{validityField}</GridItem>
        </Grid>
    );
};
