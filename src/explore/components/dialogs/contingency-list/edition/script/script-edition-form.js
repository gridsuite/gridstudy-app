/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { NAME, SCRIPT } from 'explore/components/utils/field-constants';
import React from 'react';
import ScriptInputForm from '../../script/script-input-form';
import { UniqueNameInput } from '../../../commons/unique-name-input';
import { ElementType } from '../../../../../utils/elementType';

const ScriptEditionForm = () => {
    return (
        <Grid container spacing={2} marginTop={'auto'}>
            <Grid item xs={12}>
                <UniqueNameInput
                    name={NAME}
                    label={'nameProperty'}
                    elementType={ElementType.CONTINGENCY_LIST}
                />
            </Grid>
            <ScriptInputForm name={SCRIPT} />
        </Grid>
    );
};

export default ScriptEditionForm;
