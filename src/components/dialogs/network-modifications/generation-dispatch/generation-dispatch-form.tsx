/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { DirectoryItemsInput, ElementType, EquipmentType, FieldLabel, FloatInput } from '@gridsuite/commons-ui';
import {
    DEFAULT_OUTAGE_RATE,
    GENERATORS_WITH_FIXED_ACTIVE_POWER,
    GENERATORS_WITHOUT_OUTAGE,
    LOSS_COEFFICIENT,
} from 'components/utils/field-constants';
import { percentageTextField } from '../../dialog-utils';
import { Box, Grid, Typography } from '@mui/material';
import FrequencyReservePane from './frequency-reserve-pane';
import SubstationsGeneratorsOrderingPane from './substations-generators-ordering-pane';
import GridItem from '../../commons/grid-item';
import GridSection from '../../commons/grid-section';
import { useEffect, useState } from 'react';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { UUID } from 'node:crypto';
import { FormattedMessage } from 'react-intl';

interface GenerationDispatchFormProps {
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
}

const GenerationDispatchForm = ({
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
}: Readonly<GenerationDispatchFormProps>) => {
    const currentNodeUuid = currentNode?.id;
    const [substations, setSubstations] = useState<string[]>([]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
            fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                [],
                EquipmentType.SUBSTATION,
                true
            ).then((values: string[]) => {
                setSubstations(values.sort((a, b) => a.localeCompare(b)));
            });
        }
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    const lossCoefficientField = (
        <FloatInput name={LOSS_COEFFICIENT} label={'LossCoefficient'} adornment={percentageTextField} />
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
                    elementType={ElementType.FILTER}
                    titleId={'FiltersListsSelection'}
                    label={'FiltersListsSelection'}
                />
            </Grid>
        </Grid>
    );

    const defaultOutageRateField = (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="body1" component="h4" fontWeight="fontWeightMedium">
                    <FormattedMessage id="GeneratorAvailability" />
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <FloatInput name={DEFAULT_OUTAGE_RATE} label={'DefaultOutageRate'} adornment={percentageTextField} />
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
                    elementType={ElementType.FILTER}
                    titleId={'FiltersListsSelection'}
                    label={'FiltersListsSelection'}
                />
            </Grid>
        </Grid>
    );

    return (
        <Box pt={2}>
            <Grid container spacing={2} mb={2}>
                <GridItem size={4}>{lossCoefficientField}</GridItem>
                <GridItem size={12}>{generatorsWithFixedActivePowerField}</GridItem>
            </Grid>
            <GridSection title="ReduceMaxP" />
            <Grid container spacing={2} mb={3}>
                <GridItem size={4}>{defaultOutageRateField}</GridItem>
                <GridItem size={12}>{generatorsWithoutOutageField}</GridItem>
            </Grid>
            <Grid container spacing={2}>
                <Grid item>
                    <Typography variant="body1" component="h4" fontWeight="fontWeightMedium">
                        <FormattedMessage id="frequencyReserve" />
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <FrequencyReservePane />
                </Grid>
            </Grid>
            <GridSection title="GeneratorsOrdering" />
            <Grid container direction="column" spacing={2} alignItems="start">
                <SubstationsGeneratorsOrderingPane substations={substations} />
            </Grid>
        </Box>
    );
};

export default GenerationDispatchForm;
