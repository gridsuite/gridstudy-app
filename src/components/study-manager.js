/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef } from 'react';
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
        fontSize: '18px',
    },
})(Typography);

const DonwnloadIframe = 'downloadIframe';
/**
 * Card displaying a study on the screen, with the ability to open and edit it
 * @param {object} study Study object containing ad hoc information to be displayed on the card
 * @param {String} study.studyName Name of the study
 * @param {String} study.caseFormat Format of the study
 * @param {String} study.description Description of the study
 * @param {Date} study.creationDate Date of the study
 * @param {EventListener} onClick Event to open the study
 * @param inprogressLoader
 */
const StudyCard = ({ study, onClick, studyCreationLoader }) => {
    const classes = useStyles();
    const intl = useIntl();

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
        deleteStudy(study.studyName, study.userId).then((response) => {
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
        renameStudy(study.studyName, study.userId, newStudyNameValue).then(
            (response) => {
                if (!response.ok) {
                    setRenameError(
                        intl.formatMessage({ id: 'renameStudyError' })
                    );
                } else {
                    setOpenRename(false);
                }
            }
        );
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

    return (
        <div className={classes.container}>
            <Card className={classes.root}>
                <CardActionArea
                    onClick={!studyCreationLoader ? () => onClick() : undefined}
                    className={classes.card}
                >
                    {studyCreationLoader && (
                        <LoaderWithOverlay
                            color="inherit"
                            loaderSize={35}
                            isFixed={false}
                            loadingMessageText="loadingCreationStudy"
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
                        open={Boolean(anchorEl)}
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

                        {!studyCreationLoader && (
                            <MenuItem onClick={handleOpenRename}>
                                <ListItemIcon>
                                    <EditIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<FormattedMessage id="rename" />}
                                />
                            </MenuItem>
                        )}

                        {!studyCreationLoader && (
                            <MenuItem onClick={handleOpenExport}>
                                <ListItemIcon>
                                    <GetAppIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<FormattedMessage id="export" />}
                                />
                            </MenuItem>
                        )}

                        {!studyCreationLoader && (
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
                        <CustomTypography className={classes.label}>
                            <FormattedMessage id="studyName" />:{' '}
                            <span className={classes.contentStyle}>
                                {study.studyName}
                            </span>
                        </CustomTypography>
                        <CustomTypography className={classes.label}>
                            <FormattedMessage id="studyDescription" />:{' '}
                            <span className={classes.contentStyle}>
                                {study.description ? study.description : '—'}
                            </span>
                        </CustomTypography>
                        <CustomTypography className={classes.label}>
                            <FormattedMessage id="owner" />:{' '}
                            <span className={classes.contentStyle}>
                                {study.userId}
                            </span>
                        </CustomTypography>
                    </CardContent>
                </Collapse>
            </Card>
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
                studyName={study.studyName}
                userId={study.userId}
                title={useIntl().formatMessage({ id: 'exportNetwork' })}
            />
            <AccessRightsDialog
                open={openAccessRightsDialog}
                onClose={handleCloseAccessRights}
                studyName={study.studyName}
                userId={study.userId}
                title={useIntl().formatMessage({ id: 'modifyAccessRights' })}
                isPrivate={study.studyPrivate}
            />
        </div>
    );
};

StudyCard.propTypes = {
    study: PropTypes.shape({
        studyName: PropTypes.string.isRequired,
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
    const dispatch = useDispatch();
    const websocketExpectedCloseRef = useRef();

    const studies = useSelector((state) => state.studies);
    const studyCreationRequests = useSelector(
        (state) => state.temporaryStudies
    );

    const classes = useStyles();

    const dispatchStudies = useCallback(() => {
        fetchStudyCreationRequests().then((studies) => {
            dispatch(loadStudyCreationRequestsSuccess(studies));
        });
        fetchStudies().then((studies) => {
            dispatch(loadStudiesSuccess(studies));
        });
        // Note: dispatch doesn't change
    }, [dispatch]);

    const connectNotificationsUpdateStudies = useCallback(() => {
        const ws = connectNotificationsWsUpdateStudies();

        ws.onmessage = function (event) {
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
    }, [dispatchStudies]);

    useEffect(() => {
        dispatchStudies();

        const ws = connectNotificationsUpdateStudies();
        // Note: dispatch doesn't change

        // cleanup at unmount event
        return function () {
            ws.close();
        };
    }, [connectNotificationsUpdateStudies, dispatchStudies]);

    return (
        <Container maxWidth="lg" className={classes.cardContainer}>
            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs={12} sm={6} md={3} align="center">
                    <Box className={classes.addButtonBox}>
                        <CreateStudyForm />
                    </Box>
                </Grid>
                {studyCreationRequests &&
                    studyCreationRequests.map((study) => (
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
                                onClick={() => onClick(study.studyName)}
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
                            onClick={() =>
                                onClick(study.studyName, study.userId)
                            }
                        />
                    </Grid>
                ))}
            </Grid>
            <iframe
                id={DonwnloadIframe}
                name={DonwnloadIframe}
                title={DonwnloadIframe}
                style={{ visibility: 'hidden', width: 0, height: 0 }}
            />
        </Container>
    );
};

StudyManager.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default StudyManager;
