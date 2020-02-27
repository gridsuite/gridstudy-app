/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";

import Grid from '@material-ui/core/Grid';
import {makeStyles} from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import DeleteIcon from '@material-ui/icons/Delete';
import KeyHandler, {KEYUP, KEYDOWN} from 'react-key-handler';
import Alert from '@material-ui/lab/Alert'

import {ReactComponent as PowsyblLogo} from '../images/powsybl_logo.svg';
import {ReactComponent as EntsoeLogo} from '../images/entsoe_logo.svg';
import {ReactComponent as UcteLogo} from '../images/ucte_logo.svg';
import {ReactComponent as IeeeLogo} from '../images/ieee_logo.svg';

import {loadStudiesSuccess, addSelectedStudy, removeSelectedStudy, removeAllSelectedStudies} from '../redux/actions';
import {fetchStudies, deleteStudy} from '../utils/rest-api';
import {useIntl, FormattedMessage} from "react-intl";

import {CreateStudyForm} from './create-study-form';

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
    },
    ok : {
        backgroundColor : theme.bgColor1
    },

    okk : {
        backgroundColor : theme.bgColor2
    }
}));

const StudyCard = (props) => {
    const mousePositionInitialState = {
        mouseX: null,
        mouseY: null,
    };
    const [mousePosition, setMousePosition] = React.useState(mousePositionInitialState);
    const [open, setOpen] = React.useState(false);
    const [studyToBeDeleted, setStudyToBeDeleted] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [success, setSucces] = React.useState(null);

    const [ctrlPressed, setCtrlPressed] = React.useState(false);

    const selectedStudies = useSelector(state => state.selectedStudies);

    const dispatch = useDispatch();
    const intl = useIntl();
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

    const handleSelectCard = () => {
        if (selectedStudies.includes(props.study.studyName)) {
            if (ctrlPressed) {
                dispatch(removeSelectedStudy(props.study.studyName));
            } else {
                dispatch(removeAllSelectedStudies());
            }
        } else {
            if (ctrlPressed) {
                dispatch(addSelectedStudy(props.study.studyName));
            } else {
                dispatch(removeAllSelectedStudies());
                dispatch(addSelectedStudy(props.study.studyName));
            }
        }
    };

    const handleCtrlDown = event => {
        event.preventDefault();
        setCtrlPressed(true);
    };

    const handleCtrlUp = event => {
        event.preventDefault();
        setCtrlPressed(false);
    };

    const handleCtrlADown = event => {
        event.preventDefault();
        if (ctrlPressed) {
            dispatch(addSelectedStudy(props.study.studyName))
        }
    };

    const  handleEscapePressed = event => {
        event.preventDefault();
        dispatch(removeAllSelectedStudies())
    };

    const handleClose = () => {
        setMousePosition(mousePositionInitialState);
    };

    const handleDeleteStudy = () => {
        setMousePosition(mousePositionInitialState);
        setOpen(true);
    };

    const handleDeleteStudyConfirmed = () => {
        if (studyToBeDeleted === props.study.studyName) {
            deleteStudy(props.study.studyName).then(() => {
                    fetchStudies().then(studies => {
                        dispatch(loadStudiesSuccess(studies));
                    });
                    console.debug(studyToBeDeleted + " study deleted");
                    setErr(null);
                    setSucces(intl.formatMessage({id : 'studyDeletedSuccessMsg'}))
                }
            );
        } else {
            console.debug("study remains");
            setErr(intl.formatMessage({id : 'studyNameDidNotMatchMsg'}) + props.study.studyName)
        }
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setErr(null);
        setSucces(null);
    };

    const handleCancelDelete = () => {
        setStudyToBeDeleted(null);
        setOpen(false);
        setErr(null);
        setSucces(null);
    };

    const handleOnChange = (e) => {
        setStudyToBeDeleted(e.target.value);
    };

    return (
        <div onContextMenu={handleClick} style={{ cursor: 'context-menu' }}>
            <Card className={selectedStudies.includes(props.study.studyName) ? classes.ok : classes.okk}>
                <CardActionArea onDoubleClick={() => props.onDoubleClick()} onClick={handleSelectCard} className={classes.card}>
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

            <KeyHandler
                keyEventName={KEYDOWN}
                keyValue="Control"
                onKeyHandle={handleCtrlDown}
            />

            <KeyHandler
                keyEventName={KEYUP}
                keyValue="Control"
                onKeyHandle={handleCtrlUp}
            />

            <KeyHandler
                keyEventName={KEYDOWN}
                keyValue="a"
                onKeyHandle={handleCtrlADown}
            />

            <KeyHandler
                keyEventName={KEYDOWN}
                keyValue="Escape"
                onKeyHandle={handleEscapePressed}
            />

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
                    <TextField
                        autoFocus
                        margin="dense"
                        label=<FormattedMessage id="studyName"/>
                        type="text"
                        onChange={handleOnChange}
                        fullWidth
                    />
                    {err != null && (<Alert severity="error">{err}</Alert>)}
                    {success != null && (<Alert severity="success">{success}</Alert>)}
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

    const dispatch = useDispatch();

    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        fetchStudies()
            .then(studies => {
                dispatch(loadStudiesSuccess(studies));
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const classes = useStyles();
    const studies = useSelector(state => state.studies);
    const selectedStudies = useSelector(state => state.selectedStudies);
    const intl = useIntl();

    const tmp =   selectedStudies.length > 1 ?  intl.formatMessage({id : 'studies'})  :  intl.formatMessage({id : 'study'});
    const deleteMessage = intl.formatMessage({id : 'deleteStudiesQuestion'}) + " " + selectedStudies.length + " "+ tmp +  "?";

    const deleteSelectedStudies = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAgree = () => {
        selectedStudies.forEach((s, index) => {
                deleteStudy(s).then(r => {if(r.ok) {
                    console.debug("study" + s.studyName + "deleted");
                }}
            );
            if (index === selectedStudies.length - 1) {
                deleteStudy(s).then(() => {
                    console.log("Yes");
                    fetchStudies()
                        .then(studies => {
                            dispatch(loadStudiesSuccess(studies));
                        });
                    dispatch(removeAllSelectedStudies())
                })
            } else {
                deleteStudy(s).then(r => {if(r.ok) {
                        console.debug("study" + s.studyName + "deleted");
                    }}
                );
            }
        });
        setOpen(false);
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3} className={classes.grid}>
                <Grid item   xs={3} key="createStudy"> <CreateStudyForm/>
                </Grid>
                <Grid item   xs={2} key="deleteAll">
                    <Button
                    variant="contained"
                    color="secondary"
                    className={classes.addButton}
                    startIcon={<DeleteIcon/>}
                    onClick={deleteSelectedStudies}
                    disabled={selectedStudies.length === 0}
                     >
                        <FormattedMessage id="delete"/>
                     </Button>
                </Grid>
            </Grid>

            <Dialog
                fullScreen={false}
                open={open}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">{deleteMessage}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage id="confirmDeleteStudiesMessage"/>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="primary">
                        Disagree
                    </Button>
                    <Button onClick={handleAgree} color="primary" autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={2} className={classes.grid}>
            {
                studies.map(study =>
                    <Grid item xs={3} key={study.studyName}>
                        <StudyCard study={study} onDoubleClick={() => props.onStudyClick(study.studyName)}/>
                    </Grid>
                )
            }
            </Grid>
        </Container>
    );
};

export default StudyManager;
