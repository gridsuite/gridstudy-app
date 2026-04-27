/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, TextField } from '@mui/material';
import { filledTextField, TextInput } from '@gridsuite/commons-ui';
import { EQUIPMENT_NAME } from 'components/utils/field-constants';
import { BatteryFormInfos } from '../battery-dialog.type';

export interface BatteryDialogHeaderProps {
    batteryToModify?: BatteryFormInfos | null;
    equipmentId: string;
}

export function BatteryDialogHeader({ batteryToModify, equipmentId }: Readonly<BatteryDialogHeaderProps>) {
    return (
        <Grid container spacing={2}>
            <Grid item xs>
                <TextField
                    size="small"
                    fullWidth
                    label={'ID'}
                    value={equipmentId}
                    InputProps={{
                        readOnly: true,
                    }}
                    disabled
                    {...filledTextField}
                />
            </Grid>
            <Grid item xs>
                <TextInput
                    name={EQUIPMENT_NAME}
                    label={'Name'}
                    formProps={filledTextField}
                    previousValue={batteryToModify?.name}
                    clearable={true}
                />
            </Grid>
        </Grid>
    );
}
