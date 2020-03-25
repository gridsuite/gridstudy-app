/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";

import {FormattedMessage} from "react-intl";

import Grid from '@material-ui/core/Grid';
import {makeStyles} from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {ReactComponent as PowsyblLogo} from '../images/powsybl_logo.svg';
import {ReactComponent as EntsoeLogo} from '../images/entsoe_logo.svg';
import {ReactComponent as UcteLogo} from '../images/ucte_logo.svg';
import {ReactComponent as IeeeLogo} from '../images/ieee_logo.svg';

import {loadStudiesSuccess, setLoggedUser} from '../redux/actions';
import {fetchStudies, deleteStudy} from '../utils/rest-api';
import CreateStudyForm from "./create-study-form";
import {AuthService} from "../services/AuthService";

const useStyles = makeStyles(theme => ({
    addButton: {
        margin: theme.spacing(2),
    },
    addIcon: {
        marginRight: theme.spacing(1),
    },
    card: {
        display: 'flex',
    },
    grid: {
        flexGrow: 1,
        paddingLeft: theme.spacing(2)
    },
    logo: {
        width: 64,
        height: 64,
    }
}));

const StudyCard = (props) => {
    const mousePositionInitialState = {
        mouseX: null,
        mouseY: null,
    };
    const [mousePosition, setMousePosition] = React.useState(mousePositionInitialState);
    const [open, setOpen] = React.useState(false);
    const dispatch = useDispatch();
    const classes = useStyles();

    function logo(caseFormat) {
        switch (caseFormat) {
            case 'XIIDM':
                return <PowsyblLogo className={classes.logo}/>;
            case 'CGMES':
                return <EntsoeLogo className={classes.logo}/>;
            case 'UCTE':
                return <UcteLogo className={classes.logo}/>;
            case 'IEEE-CDF':
                return <IeeeLogo className={classes.logo}/>;
            default:
                break;
        }
    }

    const handleClick = event => {
        event.preventDefault();
        setMousePosition({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
        });
    };

    const handleClose = () => {
        setMousePosition(mousePositionInitialState);
    };

    const handleDeleteStudy = (e) => {
        setMousePosition(mousePositionInitialState);
        setOpen(true);
    };

    const handleDeleteStudyConfirmed = () => {
        deleteStudy(props.study.studyName).then(result => {
            fetchStudies().then(studies => {
                dispatch(loadStudiesSuccess(studies));
            });
        });
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleCancelDelete = () => {
        setOpen(false);
    };

    return (
        <div>
            <Card onContextMenu={handleClick} style={{ cursor: 'context-menu' }}>
                <CardActionArea onClick={() => props.onClick()} className={classes.card}>
                    <div>
                        <CardContent>
                            <Typography variant="h4">
                                {props.study.studyName}
                            </Typography>
                            <Typography component="p">
                                {props.study.description}
                            </Typography>
                        </CardContent>
                    </div>
                    { logo(props.study.caseFormat) }
                </CardActionArea>
            </Card>
            <Menu
                keepMounted
                open={mousePosition.mouseY !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    mousePosition.mouseY !== null && mousePosition.mouseX !== null
                        ? { top: mousePosition.mouseY, left: mousePosition.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={handleDeleteStudy}><FormattedMessage id="delete"/></MenuItem>
            </Menu>

            <Dialog open={open} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title"><FormattedMessage id="deleteStudy"/></DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage id="deleteStudyMsg"/>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        <FormattedMessage id="cancel"/>
                    </Button>
                    <Button onClick={handleDeleteStudyConfirmed} color="primary">
                        <FormattedMessage id="delete"/>
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

const StudyManager = (props) => {
    const  authService = new AuthService();

    const [user, setUser] = React.useState(null);

    const dispatch = useDispatch();

    function login() {
        authService.login();
    }

    function  getUser() {
        authService.getUser().then(user => {
            if (user) {
                dispatch(setLoggedUser(user));
                console.debug('User has been successfully loaded from store.');
            } else {
                console.debug('You are not logged in.');
                login();
            }
            setUser(user);
        });
    }

    function  renewToken()  {
        authService
            .renewToken()
            .then(user => {
                console.debug('Token has been sucessfully renewed. :-)');
                getUser();
            })
            .catch(error => {
                console.debug(error);
            });
    }

    function  logout() {
        authService.logout();
    }

    useEffect(() => {
        getUser();
        fetchStudies()
            .then(studies => {
                dispatch(loadStudiesSuccess(studies));
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (props.logout === true) {
            console.debug("logout");
            dispatch(setLoggedUser(null));
            logout();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.logout]);

    const studies = useSelector(state => state.studies);

    const classes = useStyles();

    return (
        <Container maxWidth="lg">
            <CreateStudyForm/>
            <Grid container spacing={2} className={classes.grid}>
            {
                studies.map(study =>
                    <Grid item xs={12} sm={6} md={3} key={study.studyName}>
                        <StudyCard study={study} onClick={() => props.onStudyClick(study.studyName)}/>
                    </Grid>
                )
            }
            </Grid>
        </Container>
    );
};

export default StudyManager;
