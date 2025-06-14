/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { Grid } from '@mui/material';
import { FloatInput, IntegerInput, SelectInput } from '@gridsuite/commons-ui';

import GridSection from '../../commons/grid-section';
import GridItem from '../../commons/grid-item';
import CountriesAutocomplete from './countries-autocomplete';
import {
    BALANCES_ADJUSTMENT,
    BALANCES_ADJUSTMENT_ADVANCED,
    BALANCES_ADJUSTMENT_BALANCE_TYPE,
    BALANCES_ADJUSTMENT_COUNTRIES_TO_BALANCE,
    BALANCES_ADJUSTMENT_MAX_NUMBER_ITERATIONS,
    BALANCES_ADJUSTMENT_THRESHOLD_NET_POSITION,
} from '../../../utils/field-constants';
import { useIntl } from 'react-intl';
import { styles } from './styles';

const BALANCE_TYPE_OPTIONS = [
    { id: 'PROPORTIONAL_TO_GENERATION_P', label: 'descLfBalanceTypeGenP' },
    {
        id: 'PROPORTIONAL_TO_GENERATION_P_MAX',
        label: 'descLfBalanceTypeGenPMax',
    },
    { id: 'PROPORTIONAL_TO_LOAD', label: 'descLfBalanceTypeLoad' },
    {
        id: 'PROPORTIONAL_TO_CONFORM_LOAD',
        label: 'descLfBalanceTypeConformLoad',
    },
];

export default function BalancesAdjustmentAdvancedContent() {
    const intl = useIntl();

    return (
        <Grid container direction="column" width={'50%'} minWidth={'300px'}>
            <GridSection title="Algorithm" />
            <Grid container spacing={2} direction="column">
                <GridItem>
                    <IntegerInput
                        name={`${BALANCES_ADJUSTMENT}.${BALANCES_ADJUSTMENT_ADVANCED}.${BALANCES_ADJUSTMENT_MAX_NUMBER_ITERATIONS}`}
                        label={'maxNumberIterations'}
                    />
                </GridItem>
                <GridItem>
                    <FloatInput
                        name={`${BALANCES_ADJUSTMENT}.${BALANCES_ADJUSTMENT_ADVANCED}.${BALANCES_ADJUSTMENT_THRESHOLD_NET_POSITION}`}
                        label={'thresholdNetPosition'}
                    />
                </GridItem>
            </Grid>
            <GridSection title="Loadflow" />
            <Grid container spacing={2} direction="column">
                <GridItem>
                    <CountriesAutocomplete
                        name={`${BALANCES_ADJUSTMENT}.${BALANCES_ADJUSTMENT_ADVANCED}.${BALANCES_ADJUSTMENT_COUNTRIES_TO_BALANCE}`}
                        limitTags={3}
                        label={intl.formatMessage({ id: 'descLfCountriesToBalance' })}
                    />
                </GridItem>
                <GridItem>
                    <SelectInput
                        name={`${BALANCES_ADJUSTMENT}.${BALANCES_ADJUSTMENT_ADVANCED}.${BALANCES_ADJUSTMENT_BALANCE_TYPE}`}
                        label={'descLfBalanceType'}
                        options={BALANCE_TYPE_OPTIONS}
                        sx={styles.autocomplete}
                    />
                </GridItem>
            </Grid>
        </Grid>
    );
}
