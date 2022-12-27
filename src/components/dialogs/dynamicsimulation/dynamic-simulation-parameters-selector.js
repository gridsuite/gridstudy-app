/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

function makeButton(onClick, message, disabled) {
    return (
        <Grid item>
            <Button onClick={onClick} variant="contained" disabled={disabled}>
                <FormattedMessage id={message} />
            </Button>
        </Grid>
    );
}

const DynamicSimulationParametersSelector = (props) => {
    const { open, onClose, onStart } = props;

    const { selectedMappingName, setSelectedMappingName } =
        useState('gautier2');

    const { configuration, setConfiguration } = useState({
        startTime: 0,
        stopTime: 500,
    });

    const handleClose = () => {
        onClose();
    };

    const handleStart = () => {
        onStart({
            mappingName: selectedMappingName,
            dynamicSimulationConfiguration: configuration,
        });
    };

    const renderButtons = () => {
        return (
            <Grid container spacing={1} item justifyContent={'center'}>
                {makeButton(handleClose, 'close', false)}
                {makeButton(handleStart, 'Execute', false)}
            </Grid>
        );
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={'sm'}
                fullWidth={true}
            >
                <DialogTitle>
                    <Typography component="span" variant="h5">
                        <FormattedMessage id="DynamicSimulationParametersSelection" />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} direction="column" item xs={12}>
                        {/* TODO list mapping names and two spinners startTime, stopTime*/}
                        {renderButtons()}
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
};

DynamicSimulationParametersSelector.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onStart: PropTypes.func,
};

export default DynamicSimulationParametersSelector;
