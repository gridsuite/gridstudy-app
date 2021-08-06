/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { Paper, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import { useIntl } from 'react-intl';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        height: '100%',
        padding: theme.spacing(2),
        elevation: 3,
    },
}));

const NodeEditor = ({ selectedNode, handleNodeModified }) => {
    const classes = useStyles();
    const intl = useIntl();

    const [nameValue, setNameValue] = useState(selectedNode.data?.label);

    const updateNameValue = (event) => {
        setNameValue(event.target.value);
    };

    const handleValidate = (event) => {
        selectedNode.data.label = nameValue;
    };

    return (
        <Paper className={classes.paper}>
            <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={12}>
                    <TextField
                        label={'Name'}
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
        </Paper>
    );
};

NodeEditor.propTypes = {
    selectedNode: PropTypes.object.isRequired,
};

export default NodeEditor;
