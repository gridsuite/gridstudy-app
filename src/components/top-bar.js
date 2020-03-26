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
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import {makeStyles} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import SettingsIcon from '@material-ui/icons/Settings';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import { withStyles } from '@material-ui/core/styles';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import {ReactComponent as PowsyblLogo} from "../images/powsybl_logo.svg";
import PropTypes from "prop-types";
import {useSelector} from "react-redux";

const useStyles = makeStyles(() => ({
    grow: {
        flexGrow: 1,
    },
    logo: {
        width: 48,
        height: 48,
        cursor: 'pointer'
    },
    title: {
        marginLeft: 18,
        cursor: 'pointer'
    }
}));

const StyledMenu = withStyles({
    paper: {
        border: '1px solid #d3d4d5',
    },})(props => (
        <Menu
            elevation={0}
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            {...props}
        />
));

const StyledMenuItem = withStyles(theme => ({
    root: {
        '&:focus': {
            backgroundColor: theme.palette.primary.main,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.common.white,
            },
        },
    },
}))(MenuItem);

const TopBar = (props) => {

    const user = useSelector(state => state.user);

    const classes = useStyles();

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const history = useHistory();


    const onParametersClick = () => {
      if (props.onParametersClick) {
          props.onParametersClick();
      }
    };

    const onLogoClick = () => {
        history.replace("/");
    };

    return (
        <AppBar position="static" color="default" className={classes.appBar}>
            <Toolbar>
                <PowsyblLogo className={classes.logo} onClick={onLogoClick}/>
                <Typography variant="h6" className={classes.title} onClick={onLogoClick}>
                    <FormattedMessage id="appName"/>
                </Typography>
                <div className={classes.grow} />
                <h3>{user !== null ? user.profile.name : ""}</h3>

                <div>
                    <Button
                        aria-controls="customized-menu"
                        aria-haspopup="true"
                        onClick={handleClick}
                    >
                        <MenuIcon/>
                    </Button>

                    <StyledMenu
                        id="customized-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <StyledMenuItem onClick={onParametersClick}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>
                                <FormattedMessage id="settings"/>
                            </ListItemText>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={props.onLogoutClick}>
                            <ListItemIcon>
                                <ExitToAppIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText >
                                <FormattedMessage id="logout"/>
                            </ListItemText>
                        </StyledMenuItem>
                    </StyledMenu>

                </div>
            </Toolbar>
        </AppBar>
    )
};

TopBar.propTypes = {
    onParametersClick: PropTypes.func
};

export default TopBar;