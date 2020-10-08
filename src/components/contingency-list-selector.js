/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";

import {FormattedMessage} from "react-intl";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import CheckboxList from "./util/checkbox-list";
import {fetchContingencyLists} from "../utils/rest-api";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

const ContingencyListSelector = (props) => {

    const [contingencyListNames, setContingencyListNames] = useState([]);

    const [checkedContingencyListNames, setCheckedContingencyListNames] = useState([]);

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
            fetchContingencyLists().then(contingencyLists => {
                setContingencyListNames(contingencyLists.map(contingencyLists => contingencyLists.name));
            })
        }
    }, [props.open]);

    return (
        <Dialog open={props.open}
                onClose={handleClose}
                maxWidth={'sm'}
                fullWidth={true}>
            <DialogTitle>
                <Typography component="span"
                            variant="h5">
                    <FormattedMessage id="ContingencyListsSelection"/>
                </Typography>
            </DialogTitle>
            <DialogContent>
                <CheckboxList values={contingencyListNames} onChecked={handleChecked}/>
                <Grid container justify="center" item xs={12}>
                    <Button onClick={handleStart}
                            variant="contained"
                            color="primary"
                            disabled={checkedContingencyListNames.length === 0}>
                        <FormattedMessage id="Start" />
                    </Button>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

ContingencyListSelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
}

export default ContingencyListSelector;
