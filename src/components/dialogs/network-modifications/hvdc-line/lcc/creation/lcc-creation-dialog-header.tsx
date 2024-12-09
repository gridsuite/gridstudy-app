/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TextInput } from '@gridsuite/commons-ui';
import { EQUIPMENT_ID, EQUIPMENT_NAME } from '../../../../../utils/field-constants';
import { Grid } from '@mui/material';
import GridItem from '../../../../commons/grid-item';
import { filledTextField } from '../../../../dialog-utils';

export default function LccCreationDialogHeader() {
    const LccIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );
    const LccNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={{ ...filledTextField }} />;
    return (
        <Grid container item spacing={2}>
            <GridItem size={4}>{LccIdField}</GridItem>
            <GridItem size={4}>{LccNameField}</GridItem>
        </Grid>
    );
}
