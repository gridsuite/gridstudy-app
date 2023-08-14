/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { filledTextField, gridItem } from 'components/dialogs/dialogUtils';
import { EQUIPMENT_NAME } from 'components/utils/field-constants';
import TextInput from 'components/utils/rhf-inputs/text-input';
import { FunctionComponent } from 'react';

type FilterCreationFormProps = {
    title: string;
    open: boolean;
    onClose: Function;
};
export const FilterCreationForm: FunctionComponent<FilterCreationFormProps> = (
    props,
    context
) => {
    const { title, open, onClose } = props;
    const handleClose = () => {
        onClose();
    };
    const filterNameField = (
        <TextInput
            id={'NAME'}
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );
    return (
        <>
            <Grid container spacing={2}>
                {gridItem(filterNameField, 4)}
            </Grid>
        </>
    );
};
