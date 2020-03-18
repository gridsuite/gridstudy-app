/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

import {FormattedMessage} from "react-intl";

import {useDispatch, useSelector} from "react-redux";

import {useHistory} from "react-router-dom";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core/styles";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";

import {DARK_THEME, LIGHT_THEME, selectTheme, toggleUseNameState} from "../redux/actions";

const useStyles = makeStyles(theme => ({
    title: {
        padding: theme.spacing(2)
    },
    grid: {
        padding: theme.spacing(2)
    }
}));

const Parameters = () => {

    const dispatch = useDispatch();

    const history = useHistory();

    const classes = useStyles();

    const useName = useSelector(state => state.useName);

    const theme = useSelector(state => state.theme);

    const handleToggleUseName = () => {
        dispatch(toggleUseNameState());
    };

    const handleChangeTheme = (event) => {
        const theme = event.target.value;
        dispatch(selectTheme(theme));
    };

    const handleClose = () => {
        history.goBack();
    };

    return (
        <Container maxWidth="md" >
            <Typography variant="h5" className={classes.title}>
                <FormattedMessage id="parameters"/>
            </Typography>
            <Divider/>
            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs={6}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="useName"/>:
                        </Box>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Switch
                        checked={useName}
                        onChange={handleToggleUseName}
                        value={useName}
                        color="primary"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Divider/>
                </Grid>

                <Grid item xs={6}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="theme"/>:
                        </Box>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <RadioGroup row value={theme} onChange={handleChangeTheme}>
                        <FormControlLabel value={DARK_THEME} control={<Radio color="primary"/>} label={DARK_THEME} />
                        <FormControlLabel value={LIGHT_THEME} control={<Radio color="primary"/>} label={LIGHT_THEME} />
                    </RadioGroup>
                </Grid>

                <Grid item xs={12}>
                    <Divider/>
                </Grid>

                <Grid item xs={12}>
                    <Button onClick={handleClose} variant="contained" color="primary">
                        <FormattedMessage id="close"/>
                    </Button>
                </Grid>
            </Grid>
        </Container>
    )
};

export default Parameters;
