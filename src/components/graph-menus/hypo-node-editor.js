/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { useIntl } from 'react-intl';

const HypoNodeEditor = ({ selectedNode }) => {
    const intl = useIntl();

    const [nameValue, setNameValue] = useState(selectedNode.data?.label);

    const updateNameValue = (event) => {
        setNameValue(event.target.value);
    };

    const handleValidate = (event) => {
        selectedNode.data.label = nameValue;
    };

    return (
        <>
            <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={12}>
                    <TextField
                        label={intl.formatMessage({ id: 'Name' })}
                        value={nameValue}
                        onChange={updateNameValue}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={3} alignItems={'flex-start'}>
                <Grid item>
                    <Button onClick={handleValidate}>
                        {intl.formatMessage({ id: 'validate' })}
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

HypoNodeEditor.propTypes = {
    selectedNode: PropTypes.object.isRequired,
};

export default HypoNodeEditor;
