/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { FormattedMessage, useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import { useSnackbar } from 'notistack';
import { ReportViewer } from '@gridsuite/commons-ui';

import { ReactComponent as PowsyblLogo } from '../images/powsybl_logo.svg';
import { ReactComponent as EntsoeLogo } from '../images/entsoe_logo.svg';
import { ReactComponent as UcteLogo } from '../images/ucte_logo.svg';
import { ReactComponent as IeeeLogo } from '../images/ieee_logo.svg';
import { ReactComponent as MatpowerLogo } from '../images/matpower_logo.svg';

import {
    loadStudiesSuccess,
    loadStudyCreationRequestsSuccess,
} from '../redux/actions';

import {
    deleteStudy,
    fetchStudies,
    renameStudy,
    fetchStudyCreationRequests,
    connectNotificationsWsUpdateStudies,
    fetchReport,
} from '../utils/rest-api';

import { CardHeader } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import CardActions from '@material-ui/core/CardActions';
import clsx from 'clsx';
import GetAppIcon from '@material-ui/icons/GetApp';
import withStyles from '@material-ui/core/styles/withStyles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import BuildIcon from '@material-ui/icons/Build';
import { DeleteDialog, ExportDialog, RenameDialog } from '../utils/dialogs';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CreateStudyForm from './create-study-form';
import LoaderWithOverlay from './loader-with-overlay';
import AccessRightsDialog from './access-rights-dialog';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import AccountTreeIcon from '@material-ui/icons/AccountTree';

const useStyles = makeStyles((theme) => ({
    card: {
        display: 'flex',
    },
    grid: {
        flexGrow: 1,
        paddingLeft: theme.spacing(2),
    },
    logo: {
        width: 48,
        height: 48,
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    actions: {
        padding: theme.spacing(0.5),
    },
    cardContainer: {
        marginTop: '48px',
    },
    addButtonBox: {
        borderStyle: 'dashed',
        borderRadius: 1,
        opacity: '0.3',
    },
    cardTitle: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '11rem',
    },
    tooltip: {
        fontSize: 18,
    },
    container: {
        position: 'relative',
    },
    contentStyle: {
        fontWeight: 400,
        textTransform: 'lowercase',
    },
}));

const CustomTypography = withStyles({
    root: {
        textTransform: 'uppercase',
        fontWeight: 500,
        fontSize: '16px',
    },
})(Typography);

function makeKey({ userId, studyName }) {
    return userId + '/' + studyName;
}

const DonwnloadIframe = 'downloadIframe';
/**
 * Card displaying a study on the screen, with the ability to open and edit it
 * @param {object} study Study object containing ad hoc information to be displayed on the card
 * @param {String} study.studyUuid Name of the study
 * @param {String} study.caseFormat Format of the study
 * @param {String} study.description Description of the study
 * @param {String} study.creationDate Date of the study
 * @param {EventListener} onClick Event to open the study
 * @param inprogressLoader
 */
const StudyCard = ({ study, onClick, studyCreationLoader }) => {
    const classes = useStyles();
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    function logo(caseFormat) {
        switch (caseFormat) {
            case 'XIIDM':
                return <PowsyblLogo className={classes.logo} />;
            case 'CGMES':
                return <EntsoeLogo className={classes.logo} />;
            case 'UCTE':
                return <UcteLogo className={classes.logo} />;
            case 'IEEE-CDF':
            case 'IEEE CDF': // for powsybl <= 3.1 compatibility
                return <IeeeLogo className={classes.logo} />;
            case 'MATPOWER':
                return <MatpowerLogo className={classes.logo} />;
            default:
                break;
        }
    }

    const StyledMenu = withStyles({
        paper: {
            border: '1px solid #d3d4d5',
        },
    })((props) => (
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

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    /**
     * Delete dialog: window status value for deletion
     */
    const [openDeleteDialog, setOpenDelete] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState('');

    const handleOpenDelete = () => {
        setAnchorEl(null);
        setOpenDelete(true);
    };

    const handleClickDelete = () => {
        deleteStudy(study.studyUuid).then((response) => {
            if (!response.ok) {
                setDeleteError(intl.formatMessage({ id: 'deleteStudyError' }));
            }
        });
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
        setDeleteError('');
    };

    /**
     * Rename dialog: window status value for renaming
     */
    const [openRenameDialog, setOpenRename] = React.useState(false);
    const [renameError, setRenameError] = React.useState('');

    const handleOpenRename = () => {
        setAnchorEl(null);
        setOpenRename(true);
    };

    const handleClickRename = (newStudyNameValue) => {
        renameStudy(study.studyUuid, newStudyNameValue)
            .then((response) => {
                if (response === 'NOT_ALLOWED') {
                    setRenameError(
                        intl.formatMessage({ id: 'renameStudyError' })
                    );
                } else {
                    setOpenRename(false);
                }
            })
            .catch((e) => {
                setRenameError(e.message || e);
            });
    };

    const handleCloseRename = () => {
        setOpenRename(false);
        setRenameError('');
    };

    /**
     * Export dialog: window status value for exporting a network
     */
    const [openExportDialog, setOpenExport] = React.useState(false);

    const handleOpenExport = () => {
        setAnchorEl(null);
        setOpenExport(true);
    };

    const handleCloseExport = () => {
        setOpenExport(false);
    };

    const handleClickExport = (url) => {
        window.open(url, DonwnloadIframe);
        handleCloseExport();
    };

    const [openAccessRightsDialog, setOpenAccessRightsDialog] = React.useState(
        false
    );

    const handleOpenAccessRights = () => {
        setAnchorEl(null);
        setOpenAccessRightsDialog(true);
    };

    const handleCloseAccessRights = () => {
        setOpenAccessRightsDialog(false);
    };

    /**
     * Status for displaying additional information
     */
    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    /**
     * Report dialog
     */
    const [openReportViewer, setOpenReportViewer] = useState(false);
    const [report, setReport] = useState(null);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);

    const handleCloseReport = () => {
        setReport(null);
        setOpenReportViewer(false);
    };

    const handleClickShowReport = () => {
        setWaitingLoadReport(true);
        setAnchorEl(null);
        fetchReport(study.studyUuid)
            .then((report) => {
                setReport(report);
                setOpenReportViewer(true);
            })
            .catch((errorMessage) =>
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                })
            )
            .finally(() => {
                setAnchorEl(null);
                setWaitingLoadReport(false);
            });
    };

    const isWaitingLoading = useCallback(() => {
        return studyCreationLoader || waitingLoadReport;
    }, [studyCreationLoader, waitingLoadReport]);

    return (
        <div className={classes.container}>
            <Card className={classes.root}>
                <CardActionArea
                    onClick={!studyCreationLoader ? () => onClick() : undefined}
                    className={classes.card}
                >
                    {isWaitingLoading() && (
                        <LoaderWithOverlay
                            color="inherit"
                            loaderSize={35}
                            isFixed={false}
                            loadingMessageText={
                                studyCreationLoader
                                    ? 'loadingCreationStudy'
                                    : 'loadingReport'
                            }
                        />
                    )}
                    <Tooltip
                        title={study.studyName}
                        placement="top"
                        arrow
                        enterDelay={1000}
                        enterNextDelay={1000}
                        classes={{ tooltip: classes.tooltip }}
                    >
                        <div>
                            <CardHeader
                                avatar={
                                    studyCreationLoader ? (
                                        <canvas className={classes.logo} />
                                    ) : (
                                        logo(study.caseFormat)
                                    )
                                }
                                title={
                                    <div className={classes.cardTitle}>
                                        <Typography noWrap variant="h5">
                                            {study.studyName}
                                        </Typography>
                                    </div>
                                }
                                subheader={new Date(
                                    study.creationDate
                                ).toLocaleString()}
                            />
                        </div>
                    </Tooltip>
                </CardActionArea>
                <CardActions className={classes.actions}>
                    <IconButton
                        className={clsx(classes.expand, {
                            [classes.expandOpen]: expanded,
                        })}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                    <IconButton
                        aria-label="settings"
                        aria-controls="case-menu"
                        aria-haspopup="true"
                        variant="contained"
                        onClick={handleOpenMenu}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <StyledMenu
                        id="case-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={
                            Boolean(anchorEl) &&
                            !waitingLoadReport &&
                            !openReportViewer
                        }
                        onClose={handleCloseMenu}
                    >
                        <MenuItem onClick={handleOpenDelete}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={<FormattedMessage id="delete" />}
                            />
                        </MenuItem>

                        {!isWaitingLoading() && (
                            <MenuItem onClick={handleClickShowReport}>
                                <ListItemIcon>
                                    <AccountTreeIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <FormattedMessage id="showReport" />
                                    }
                                />
                            </MenuItem>
                        )}

                        {!isWaitingLoading() && (
                            <MenuItem onClick={handleOpenRename}>
                                <ListItemIcon>
                                    <EditIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<FormattedMessage id="rename" />}
                                />
                            </MenuItem>
                        )}

                        {!isWaitingLoading() && (
                            <MenuItem onClick={handleOpenExport}>
                                <ListItemIcon>
                                    <GetAppIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<FormattedMessage id="export" />}
                                />
                            </MenuItem>
                        )}

                        {!isWaitingLoading() && (
                            <MenuItem onClick={handleOpenAccessRights}>
                                <ListItemIcon>
                                    <BuildIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <FormattedMessage id="accessRights" />
                                    }
                                />
                            </MenuItem>
                        )}
                    </StyledMenu>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <CustomTypography>
                            <FormattedMessage id="studyNameProperty" />
                            <span className={classes.contentStyle}>
                                {study.studyName}
                            </span>
                        </CustomTypography>
                        <CustomTypography>
                            <FormattedMessage id="studyDescriptionProperty" />
                            <span className={classes.contentStyle}>
                                {study.description ? study.description : '—'}
                            </span>
                        </CustomTypography>
                        <CustomTypography>
                            <FormattedMessage id="owner" />
                            <span className={classes.contentStyle}>
                                {study.userId}
                            </span>
                        </CustomTypography>
                    </CardContent>
                </Collapse>
            </Card>
            {report && (
                <ReportViewer
                    title={'Logs : ' + study.studyUuid}
                    open={openReportViewer}
                    onClose={handleCloseReport}
                    jsonReport={report}
                />
            )}
            <DeleteDialog
                open={openDeleteDialog}
                onClose={handleCloseDelete}
                onClick={handleClickDelete}
                title={useIntl().formatMessage({ id: 'deleteStudy' })}
                message={useIntl().formatMessage({ id: 'deleteStudyMsg' })}
                error={deleteError}
            />
            <RenameDialog
                open={openRenameDialog}
                onClose={handleCloseRename}
                onClick={handleClickRename}
                title={useIntl().formatMessage({ id: 'renameStudy' })}
                message={useIntl().formatMessage({ id: 'renameStudyMsg' })}
                currentName={study.studyName}
                error={renameError}
            />
            <ExportDialog
                open={openExportDialog}
                onClose={handleCloseExport}
                onClick={handleClickExport}
                studyUuid={study.studyUuid}
                title={useIntl().formatMessage({ id: 'exportNetwork' })}
            />
            <AccessRightsDialog
                open={openAccessRightsDialog}
                onClose={handleCloseAccessRights}
                studyUuid={study.studyUuid}
                title={useIntl().formatMessage({ id: 'modifyAccessRights' })}
                isPrivate={study.studyPrivate}
            />
        </div>
    );
};

StudyCard.propTypes = {
    study: PropTypes.shape({
        studyUuid: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        caseFormat: PropTypes.string,
        description: PropTypes.string,
        creationDate: PropTypes.string,
    }),
    onClick: PropTypes.func.isRequired,
};

/**
 * Container displaying the *StudyCard* and the study creation feature
 * @param {EventListener} onClick Action to open the study
 */
const StudyManager = ({ onClick }) => {
    const intlRef = useIntlRef();

    const dispatch = useDispatch();
    const websocketExpectedCloseRef = useRef();

    const studies = useSelector((state) => state.studies);
    const studyCreationRequests = useSelector(
        (state) => state.temporaryStudies
    );

    const classes = useStyles();

    const [localCreationRequests, setlocalCreationRequests] = useState({});
    const studyCreationSubmitted = useRef(new Set());

    const { enqueueSnackbar } = useSnackbar();

    const dispatchStudies = useCallback(() => {
        fetchStudyCreationRequests().then((studies) => {
            dispatch(loadStudyCreationRequestsSuccess(studies));
        });
        fetchStudies().then((studies) => {
            dispatch(loadStudiesSuccess(studies));
        });
        // Note: dispatch doesn't change
    }, [dispatch]);

    const displayErrorIfExist = useCallback(
        (event) => {
            let eventData = JSON.parse(event.data);
            if (eventData.headers) {
                const error = eventData.headers['error'];
                if (error) {
                    const studyName = eventData.headers['studyName'];
                    displayErrorMessageWithSnackbar({
                        errorMessage: error,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'studyCreatingError',
                            headerMessageValues: { studyName: studyName },
                            intlRef: intlRef,
                        },
                    });
                }
            }
        },
        [enqueueSnackbar, intlRef]
    );

    const connectNotificationsUpdateStudies = useCallback(() => {
        const ws = connectNotificationsWsUpdateStudies();

        ws.onmessage = function (event) {
            displayErrorIfExist(event);
            dispatchStudies();
        };
        ws.onclose = function (event) {
            if (!websocketExpectedCloseRef.current) {
                console.error('Unexpected Notification WebSocket closed');
            }
        };
        ws.onerror = function (event) {
            console.error('Unexpected Notification WebSocket error', event);
        };
        return ws;
    }, [dispatchStudies, displayErrorIfExist]);

    useEffect(() => {
        dispatchStudies();

        const ws = connectNotificationsUpdateStudies();
        // Note: dispatch doesn't change

        // cleanup at unmount event
        return function () {
            ws.close();
        };
    }, [connectNotificationsUpdateStudies, dispatchStudies]);

    function addCreationRequest({ studyName, userId, ...rest }) {
        setlocalCreationRequests({
            ...localCreationRequests,
            ...{
                [makeKey({ userId: userId, studyName: studyName })]: {
                    studyName: studyName,
                    userId: userId,
                    ...rest,
                },
            },
        });
    }

    function addStudyCreationSubmitted(study) {
        studyCreationSubmitted.current.add(makeKey(study));
    }

    const cleanLocalCreationRequests = useCallback(
        (remote) => {
            function deleteKey(list, key) {
                if (list.hasOwnProperty(key)) {
                    delete localCreationRequests[key];
                    return true;
                }
                return false;
            }

            if (localCreationRequests) {
                let didDelete = false;
                remote.forEach((study) => {
                    didDelete |= deleteKey(
                        localCreationRequests,
                        makeKey(study)
                    );
                });
                studyCreationSubmitted.current.forEach((key) => {
                    didDelete |= deleteKey(localCreationRequests, key);
                });
                studyCreationSubmitted.current.clear();
                if (didDelete)
                    setlocalCreationRequests(
                        Object.assign({}, localCreationRequests)
                    );
            }
        },
        [localCreationRequests]
    );

    useEffect(() => {
        cleanLocalCreationRequests(studyCreationRequests);
    }, [studyCreationRequests, cleanLocalCreationRequests]);

    useEffect(() => {
        cleanLocalCreationRequests(studies);
    }, [studies, cleanLocalCreationRequests]);

    function mergeCreationRequests(remote, local) {
        let merged = {};
        if (local)
            Object.values(local).forEach((study) => {
                merged[makeKey(study)] = study;
            });
        if (remote)
            remote.forEach((study) => {
                merged[makeKey(study)] = study;
            });
        return Object.values(merged);
    }

    return (
        <Container maxWidth="lg" className={classes.cardContainer}>
            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs={12} sm={6} md={3} align="center">
                    <Box className={classes.addButtonBox}>
                        <CreateStudyForm
                            addCreationRequest={addCreationRequest}
                            addStudyCreationSubmitted={
                                addStudyCreationSubmitted
                            }
                        />
                    </Box>
                </Grid>
                {(studyCreationRequests || localCreationRequests) &&
                    mergeCreationRequests(
                        studyCreationRequests,
                        localCreationRequests
                    ).map((study) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={3}
                            key={study.userId + '/' + study.studyName}
                        >
                            <StudyCard
                                studyCreationLoader={true}
                                study={study}
                                onClick={() => onClick(study.studyUuid)}
                            />
                        </Grid>
                    ))}
                {studies.map((study) => (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        key={study.userId + '/' + study.studyName}
                    >
                        <StudyCard
                            studyCreationLoader={false}
                            study={study}
                            onClick={() => onClick(study.studyUuid)}
                        />
                    </Grid>
                ))}
            </Grid>
            <iframe
                id={DonwnloadIframe}
                name={DonwnloadIframe}
                title={DonwnloadIframe}
                style={{ display: 'none' }}
            />
        </Container>
    );
};

StudyManager.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default StudyManager;
