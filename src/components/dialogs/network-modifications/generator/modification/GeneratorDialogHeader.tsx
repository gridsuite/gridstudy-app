/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import { ENERGY_SOURCE, EQUIPMENT_NAME } from '../../../../utils/field-constants';
import { GeneratorFormInfos } from '../generator-dialog.type';
import { filledTextField, SelectInput, TextInput } from '@gridsuite/commons-ui';
import { ENERGY_SOURCES, getEnergySourceLabel } from 'components/network/constants';

export interface GeneratorDialogHeaderProps {
    generatorToModify?: GeneratorFormInfos | null;
    equipmentId: string;
}

export function GeneratorDialogHeader({ generatorToModify, equipmentId }: Readonly<GeneratorDialogHeaderProps>) {
    const intl = useIntl();

    const energySourceLabelId = getEnergySourceLabel(generatorToModify?.energySource);
    const previousEnergySourceLabel = energySourceLabelId
        ? intl.formatMessage({
              id: energySourceLabelId,
          })
        : undefined;

    const generatorIdField = (
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
    );

    const generatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={generatorToModify?.name}
            clearable={true}
        />
    );

    const energySourceField = (
        <SelectInput
            name={ENERGY_SOURCE}
            label={'energySource'}
            options={[...ENERGY_SOURCES]}
            fullWidth
            size={'small'}
            formProps={{ ...filledTextField }}
            previousValue={previousEnergySourceLabel}
        />
    );

    return (
        <Grid container spacing={2}>
            <Grid item xs>
                {generatorIdField}
            </Grid>
            <Grid item xs>
                {generatorNameField}
            </Grid>
            <Grid item xs>
                {energySourceField}
            </Grid>
        </Grid>
    );
}
