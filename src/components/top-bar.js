/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from "react";

import {useDispatch, useSelector} from "react-redux";

import {FormattedMessage, useIntl} from "react-intl";

import AppBar from "@material-ui/core/AppBar";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import {makeStyles} from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import BrightnessLowIcon from "@material-ui/icons/BrightnessLow";
import BrightnessHighIcon from "@material-ui/icons/BrightnessHigh";

import {selectDarkTheme, toggleUseNameState} from "../redux/actions";
import {ReactComponent as PowsyblLogo} from "../images/powsybl_logo.svg";

const useStyles = makeStyles(theme => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    grow: {
        flexGrow: 1,
    },
    logo: {
        width: 48,
        height: 48,
    },
    title: {
        marginLeft: 18
    }
}));

const TopBar = () => {

    const dispatch = useDispatch();

    const dark = useSelector(state => state.darkTheme);

    const useName = useSelector(state => state.useName);

    const intl = useIntl();

    const classes = useStyles();

    function switchTheme() {
        dispatch(selectDarkTheme(!dark));
    }

    const handleToggleUseName = () => {
        dispatch(toggleUseNameState());
    };

    const useNameLabel = intl.formatMessage({id : 'useName'});

    return (
        <AppBar position="static" color="default" className={classes.appBar}>
            <Toolbar>
                <PowsyblLogo className={classes.logo}/>
                <Typography variant="h6" className={classes.title}>
                    <FormattedMessage id="appName"/>
                </Typography>
                <div className={classes.grow} />
                <FormControlLabel
                    control={
                        <Switch
                            checked={useName}
                            onChange={handleToggleUseName}
                            value={useName}
                            color="primary"
                        />
                    }
                    label={useNameLabel}
                />
                <IconButton aria-label="Change theme" color="inherit" onClick={() => switchTheme()}>
                    { dark ? <BrightnessLowIcon /> : <BrightnessHighIcon /> }
                </IconButton>
            </Toolbar>
        </AppBar>
    )
};

export default TopBar;