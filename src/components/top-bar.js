/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from "react";

import {FormattedMessage} from "react-intl";
import {useHistory} from 'react-router-dom';

import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import {makeStyles} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import SettingsIcon from '@material-ui/icons/Settings';

import {ReactComponent as PowsyblLogo} from "../images/powsybl_logo.svg";
import PropTypes from "prop-types";

const useStyles = makeStyles(theme => ({
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

const TopBar = (props) => {

    const classes = useStyles();

    const history = useHistory();

    const onParametersClick = () => {
      if (props.onParametersClick) {
          props.onParametersClick();
      }
    };

    const onLogoClick = () => {
        history.replace("/");
    }

    return (
        <AppBar position="static" color="default" className={classes.appBar}>
            <Toolbar>
                <PowsyblLogo className={classes.logo} onClick={onLogoClick}/>
                <Typography variant="h6" className={classes.title}>
                    <FormattedMessage id="appName"/>
                </Typography>
                <div className={classes.grow} />
                <IconButton aria-label="Parameters" color="inherit" onClick={onParametersClick}>
                    <SettingsIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
};

TopBar.propTypes = {
    onParametersClick: PropTypes.func
};

export default TopBar;