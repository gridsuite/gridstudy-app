/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import CheckboxList from './util/checkbox-list';
import {
    fetchContingencyCount,
    fetchContingencyLists,
} from '../utils/rest-api';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

const ContingencyListSelector = (props) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const [contingencyList, setContingencyList] = useState([]);

    const [simulatedContingencyCount, setSimulatedContingencyCount] = useState(
        0
    );

    const [
        checkedContingencyListNames,
        setCheckedContingencyListNames,
    ] = useState([]);

    const handleClose = () => {
        props.onClose();
    };

    const handleStart = () => {
        props.onStart(checkedContingencyListNames);
    };

    const handleChecked = (checked) => {
        setCheckedContingencyListNames(checked);
    };

    useEffect(() => {
        if (props.open) {
            fetchContingencyLists().then((contingencyLists) => {
                setContingencyList(contingencyLists);
            });
            setCheckedContingencyListNames([]);
        }
    }, [props.open]);

    useEffect(() => {
        setSimulatedContingencyCount(null);
        fetchContingencyCount(studyUuid, checkedContingencyListNames).then(
            (contingencyCount) => {
                setSimulatedContingencyCount(contingencyCount);
            }
        );
    }, [studyUuid, checkedContingencyListNames]);

    function getSimulatedContingencyCountLabel() {
        return simulatedContingencyCount != null
            ? simulatedContingencyCount
            : '...';
    }

    return (
        <Dialog
            open={props.open}
            onClose={handleClose}
            maxWidth={'sm'}
            fullWidth={true}
        >
            <DialogTitle>
                <Typography component="span" variant="h5">
                    <FormattedMessage id="ContingencyListsSelection" />
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={1} direction="column" item xs={12}>
                    <Grid item>
                        <CheckboxList
                            values={contingencyList}
                            onChecked={handleChecked}
                            label={(item) => item.name}
                            id={(item) => item.id}
                        />
                    </Grid>
                    <Grid item>
                        <Alert variant="standard" severity="info">
                            <FormattedMessage
                                id="xContingenciesWillBeSimulated"
                                values={{
                                    x: getSimulatedContingencyCountLabel(),
                                }}
                            />
                        </Alert>
                    </Grid>
                    <Grid align="center" item>
                        <Box>
                            <Button
                                onClick={handleStart}
                                variant="contained"
                                color="primary"
                                disabled={
                                    simulatedContingencyCount === null ||
                                    simulatedContingencyCount === 0
                                }
                            >
                                <FormattedMessage id="Start" />
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

ContingencyListSelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
};

export default ContingencyListSelector;
