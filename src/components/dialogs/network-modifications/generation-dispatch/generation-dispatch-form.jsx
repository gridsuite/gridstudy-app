/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { DirectoryItemsInput } from '@gridsuite/commons-ui';
import { FloatInput } from '@gridsuite/commons-ui';
import {
    LOSS_COEFFICIENT,
    DEFAULT_OUTAGE_RATE,
    GENERATORS_WITHOUT_OUTAGE,
    GENERATORS_WITH_FIXED_ACTIVE_POWER,
} from 'components/utils/field-constants';
import { gridItem, percentageTextField, GridSection } from '../../dialogUtils';
import { Box, Grid, Typography } from '@mui/material';
import {
    formatPercentageValue,
    isValidPercentage,
} from '../../percentage-area/percentage-area-utils';
import { elementType } from '@gridsuite/commons-ui';
import FrequencyReservePane from './frequency-reserve-pane';
import { FormattedMessage } from 'react-intl';
import { FieldLabel } from '@gridsuite/commons-ui';
import SubstationsGeneratorsOrderingPane from './substations-generators-ordering-pane';
import { fetchDirectoryContent, fetchRootFolders } from 'services/directory';
import { fetchElementsMetadata } from 'services/explore';

const GenerationDispatchForm = () => {
    const handleCoefficientValueChange = (id, value) => {
        return formatPercentageValue(value);
    };

    const lossCoefficientField = (
        <FloatInput
            name={LOSS_COEFFICIENT}
            label={'LossCoefficient'}
            adornment={percentageTextField}
            acceptValue={isValidPercentage}
            outputTransform={(value) =>
                handleCoefficientValueChange(LOSS_COEFFICIENT, value)
            }
        />
    );

    const generatorsWithFixedActivePowerField = (
        <Grid container alignItems="center" spacing={2} direction={'row'}>
            <Grid item xs={5}>
                <FieldLabel label={'GeneratorsWithFixedActivePower'} optional />
            </Grid>
            <Grid item xs={4}>
                <DirectoryItemsInput
                    name={GENERATORS_WITH_FIXED_ACTIVE_POWER}
                    equipmentTypes={[EQUIPMENT_TYPES.GENERATOR]}
                    elementType={elementType.FILTER}
                    titleId={'FiltersListsSelection'}
                    fetchDirectoryContent={fetchDirectoryContent}
                    fetchRootFolders={fetchRootFolders}
                    fetchElementsInfos={fetchElementsMetadata}
                />
            </Grid>
        </Grid>
    );

    const defaultOutageRateField = (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="span" component="h4">
                    <FormattedMessage id="GeneratorAvailability" />
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <FloatInput
                    name={DEFAULT_OUTAGE_RATE}
                    label={'DefaultOutageRate'}
                    adornment={percentageTextField}
                    acceptValue={isValidPercentage}
                    outputTransform={(value) =>
                        handleCoefficientValueChange(DEFAULT_OUTAGE_RATE, value)
                    }
                />
            </Grid>
        </Grid>
    );

    const generatorsWithoutOutageField = (
        <Grid container alignItems="center" spacing={2} direction={'row'}>
            <Grid item xs={5}>
                <FieldLabel label={'GeneratorsWithoutOutage'} optional />
            </Grid>
            <Grid item xs={4}>
                <DirectoryItemsInput
                    name={GENERATORS_WITHOUT_OUTAGE}
                    equipmentTypes={[EQUIPMENT_TYPES.GENERATOR]}
                    elementType={elementType.FILTER}
                    titleId={'FiltersListsSelection'}
                    fetchDirectoryContent={fetchDirectoryContent}
                    fetchRootFolders={fetchRootFolders}
                    fetchElementsInfos={fetchElementsMetadata}
                />
            </Grid>
        </Grid>
    );

    return (
        <Box pt={2}>
            <Grid container spacing={2} mb={2}>
                {gridItem(lossCoefficientField, 4)}
                {gridItem(generatorsWithFixedActivePowerField, 12)}
            </Grid>
            <GridSection title="ReduceMaxP" />
            <Grid container spacing={2} mb={3}>
                {gridItem(defaultOutageRateField, 4)}
                {gridItem(generatorsWithoutOutageField, 12)}
            </Grid>
            <Grid container spacing={2}>
                <Grid item>
                    <Typography variant="span" component="h4">
                        <FormattedMessage id="frequencyReserve" />
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <FrequencyReservePane />
                </Grid>
            </Grid>
            <GridSection title="GeneratorsOrdering" />
            <Grid container direction="column" spacing={2} alignItems="start">
                <SubstationsGeneratorsOrderingPane />
            </Grid>
        </Box>
    );
};

export default GenerationDispatchForm;
