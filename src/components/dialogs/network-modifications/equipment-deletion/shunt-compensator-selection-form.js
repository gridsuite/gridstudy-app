/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import CheckboxInput from 'components/utils/rhf-inputs/booleans/checkbox-input';
import ReadOnlyInput from 'components/utils/rhf-inputs/read-only/read-only-input';
import { SELECTED, ID } from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const ShuntCompensatorSelectionForm = ({
    title,
    arrayFormName,
    useFieldArrayOutput,
}) => {
    const { fields: currentRows } = useFieldArrayOutput;

    return (
        <Grid item container spacing={1} direction="column">
            <Grid item>
                <h4>
                    <FormattedMessage id={title} />
                </h4>
            </Grid>
            {currentRows.map((rowId, index) => (
                <Grid container spacing={1} alignItems="center">
                    <Grid item xs={1} align={'start'}>
                        <CheckboxInput
                            name={`${arrayFormName}[${index}].${SELECTED}`}
                        />
                    </Grid>
                    <Grid item xs={11} align={'start'}>
                        <ReadOnlyInput
                            name={`${arrayFormName}[${index}].${ID}`}
                        />
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
};

ShuntCompensatorSelectionForm.prototype = {
    title: PropTypes.string.isRequired,
    arrayFormName: PropTypes.string.isRequired,
    columnsDefinition: PropTypes.object.isRequired,
};

export default ShuntCompensatorSelectionForm;
