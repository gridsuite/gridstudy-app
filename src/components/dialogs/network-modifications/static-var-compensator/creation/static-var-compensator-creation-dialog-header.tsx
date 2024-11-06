/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { EQUIPMENT_ID, EQUIPMENT_NAME } from 'components/utils/field-constants';
import { TextInput } from '@gridsuite/commons-ui';
import GridItem from '../../../commons/grid-item';

const StaticVarCompensatorCreationDialogHeader = () => {
    const staticCompensatorIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, variant: 'filled' }} />
    );

    const staticCompensatorNameField = (
        <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={{ variant: 'filled' }} />
    );
    return (
        <Grid container item spacing={2}>
            <GridItem size={4}>{staticCompensatorIdField}</GridItem>
            <GridItem size={4}>{staticCompensatorNameField}</GridItem>
        </Grid>
    );
};

export default StaticVarCompensatorCreationDialogHeader;
