/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import React from 'react';
import ExplicitNamingForm from '../../explicit-naming/explicit-naming-form';
import { UniqueNameInput } from '../../../commons/unique-name-input';
import { NAME } from '../../../../utils/field-constants';
import { ElementType } from '../../../../../utils/elementType';

const ExplicitNamingEditionForm = () => {
    return (
        <Grid container spacing={2} marginTop={'auto'}>
            <Grid item xs={12}>
                <UniqueNameInput
                    name={NAME}
                    label={'nameProperty'}
                    elementType={ElementType.CONTINGENCY_LIST}
                />
            </Grid>
            <ExplicitNamingForm />
        </Grid>
    );
};

export default ExplicitNamingEditionForm;
