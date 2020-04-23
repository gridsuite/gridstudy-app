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
import AppsIcon from '@material-ui/icons/Apps';

import {ReactComponent as PowsyblLogo} from "../images/powsybl_logo.svg";
import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import FullscreenIcon from '@material-ui/icons/Fullscreen';

const useStyles = makeStyles(() => ({
    grow: {
        flexGrow: 1,
    },
    logo: {
        width: 48,
        height: 48,
        cursor: 'pointer'
    },
    menuIcon: {
        width: 24,
        height: 24,
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

    const [anchorElGeneralMenu, setAnchorElGeneralMenu] = React.useState(null);

    const [anchorElAppsMenu, setAnchorElAppsMenu] = React.useState(null);

    const handleClickGeneralMenu = event => {
        setAnchorElGeneralMenu(event.currentTarget);
    };

    const handleCloseGeneralMenu = () => {
        setAnchorElGeneralMenu(null);
    };
    const handleClickAppsMenu = event => {
        setAnchorElAppsMenu(event.currentTarget);
    };

    const handleCloseAppsMenu = () => {
        setAnchorElAppsMenu(null);
    };

    const history = useHistory();

    const onParametersClick = () => {
        handleCloseGeneralMenu();
      if (props.onParametersClick) {
          props.onParametersClick();
      }
    };

    const onLogoClick = () => {
        handleCloseAppsMenu();
        history.replace("/");
    };

    function requestFullscreen (ele) {
        if (ele.requestFullscreen) {
            ele.requestFullscreen();
        } else if (ele.webkitRequestFullscreen) {
            ele.webkitRequestFullscreen();
        } else if (ele.mozRequestFullScreen) {
            ele.mozRequestFullScreen();
        } else if (ele.msRequestFullscreen) {
            ele.msRequestFullscreen();
        } else {
            console.log('Fullscreen API is not supported.');
        }
    }

    function exitFullscreen () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else {
            console.log('Fullscreen API is not supported.');
        }
    }

    const onFullScreenClicked = () => {
        requestFullscreen(document.documentElement);
    };

    return (
        <AppBar position="static" color="default" className={classes.appBar}>
            <Toolbar>
                <PowsyblLogo className={classes.logo} onClick={onLogoClick}/>
                <Typography variant="h6" className={classes.title} onClick={onLogoClick}>
                    <FormattedMessage id="appName"/>
                </Typography>
                <div className={classes.grow} />

                {user && (
                    <div>
                        <Button
                            aria-controls="apps-menu"
                            aria-haspopup="true"
                            onClick={handleClickAppsMenu}
                        >
                            <AppsIcon/>
                        </Button>

                        <StyledMenu
                            id="apps-menu"
                            anchorEl={anchorElAppsMenu}
                            keepMounted
                            open={Boolean(anchorElAppsMenu)}
                            onClose={handleCloseAppsMenu}
                        >
                            <StyledMenuItem onClick={onLogoClick}>
                                <ListItemIcon>
                                    <PowsyblLogo className={classes.menuIcon}  />
                                </ListItemIcon>
                                <ListItemText >
                                    <FormattedMessage id="appName"/>
                                </ListItemText>
                            </StyledMenuItem>
                        </StyledMenu>
                        </div>
                )}

                <h3>{user !== null ? user.profile.name : ""}</h3>

                {user && (
                <div>
                    <Button
                        aria-controls="general-menu"
                        aria-haspopup="true"
                        onClick={handleClickGeneralMenu}
                    >
                        <MenuIcon/>
                    </Button>

                    <StyledMenu
                        id="general-menu"
                        anchorEl={anchorElGeneralMenu}
                        keepMounted
                        open={Boolean(anchorElGeneralMenu)}
                        onClose={handleCloseGeneralMenu}
                    >
                        <StyledMenuItem onClick={onParametersClick}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>
                                <FormattedMessage id="settings"/>
                            </ListItemText>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={onFullScreenClicked}>
                            <ListItemIcon>
                                <FullscreenIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>
                                <FormattedMessage id="fullScreen"/>
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
                    )}
            </Toolbar>
        </AppBar>
    )
};

TopBar.propTypes = {
    onParametersClick: PropTypes.func
};

export default TopBar;