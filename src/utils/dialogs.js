/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import {
    changeStudyAccessRights,
    fetchStudies,
    getAvailableExportFormats,
    getExportUrl,
} from './rest-api';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { loadStudiesSuccess } from '../redux/actions';
import { useDispatch } from 'react-redux';

/**
 * Dialog to delete an element #TODO To be moved in the common-ui repository once it has been created
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the deletion
 * @param {String} title Title of the dialog
 * @param {String} message Message of the dialog
 */
const DeleteDialog = ({ open, onClose, onClick, title, message, error }) => {
    const handleClose = () => {
        onClose();
    };

    const handleClick = () => {
        console.debug('Request for deletion');
        onClick();
    };

    const handleKeyPressed = (event) => {
        if (open && event.key === 'Enter') {
            handleClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-title-delete"
            onKeyPress={handleKeyPressed}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
                {error !== '' && <Alert severity="error">{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handleClick} variant="text">
                    <FormattedMessage id="delete" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DeleteDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};

/**
 * Dialog to rename an element #TODO To be moved in the common-ui repository once it has been created
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the renaming
 * @param {String} title Title of the dialog
 * @param {String} message Message of the dialog
 * @param {String} currentName Name before renaming
 */
const RenameDialog = ({
    open,
    onClose,
    onClick,
    title,
    message,
    currentName,
}) => {
    const [newNameValue, setNewNameValue] = React.useState(currentName);

    const updateNameValue = (event) => {
        setNewNameValue(event.target.value);
    };

    const handleClick = () => {
        if (currentName !== newNameValue) {
            console.debug(
                'Request for renaming : ' + currentName + ' => ' + newNameValue
            );
            onClick(newNameValue);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        onClose();
    };

    const handleExited = () => {
        setNewNameValue(currentName);
    };

    const handleKeyPressed = (event) => {
        if (open && event.key === 'Enter') {
            handleClick();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            onExited={handleExited}
            aria-labelledby="dialog-title-rename"
            onKeyPress={handleKeyPressed}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <InputLabel htmlFor="newName">{message}</InputLabel>
                <TextField
                    autoFocus
                    value={newNameValue}
                    required={true}
                    onChange={updateNameValue}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="text">
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handleClick} variant="outlined">
                    <FormattedMessage id="rename" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

RenameDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    currentName: PropTypes.string.isRequired,
};

/**
 * Dialog to export the network case #TODO To be moved in the common-ui repository once it has been created
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the export
 * @param studyName the name of the study to export
 * @param {String} title Title of the dialog
 * @param {String} message Message of the dialog
 */
const ExportDialog = ({ open, onClose, onClick, studyName, userId, title }) => {
    const [availableFormats, setAvailableFormats] = React.useState('');
    const [selectedFormat, setSelectedFormat] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [downloadUrl, setDownloadUrl] = React.useState('');
    const [exportStudyErr, setExportStudyErr] = React.useState('');

    const useStyles = makeStyles(() => ({
        formControl: {
            minWidth: 300,
        },
    }));

    useEffect(() => {
        if (open) {
            getAvailableExportFormats().then((formats) => {
                setAvailableFormats(formats);
            });
        }
    }, [open]);

    const handleClick = () => {
        console.debug('Request for exporting in format: ' + selectedFormat);
        if (selectedFormat) {
            setLoading(true);
            onClick(downloadUrl);
        } else {
            setExportStudyErr(
                intl.formatMessage({ id: 'exportStudyErrorMsg' })
            );
        }
    };

    const handleClose = () => {
        setExportStudyErr('');
        setLoading(false);
        onClose();
    };

    const handleExited = () => {
        setExportStudyErr('');
        setSelectedFormat('');
        setLoading(false);
        setDownloadUrl('');
    };

    const handleChange = (event) => {
        let selected = event.target.value;
        setSelectedFormat(selected);
        setDownloadUrl(getExportUrl(userId, studyName, selected));
    };

    const classes = useStyles();
    const intl = useIntl();

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            onExited={handleExited}
            aria-labelledby="dialog-title-export"
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <FormControl className={classes.formControl}>
                    <InputLabel id="select-format-label">
                        <FormattedMessage id="exportFormat" />
                    </InputLabel>
                    <Select
                        labelId="select-format-label"
                        id="controlled-select-format"
                        onChange={handleChange}
                        inputProps={{
                            id: 'select-format',
                        }}
                    >
                        {availableFormats !== '' &&
                            availableFormats.map(function (element) {
                                return (
                                    <MenuItem key={element} value={element}>
                                        {element}
                                    </MenuItem>
                                );
                            })}
                    </Select>
                </FormControl>
                {exportStudyErr !== '' && (
                    <Alert severity="error">{exportStudyErr}</Alert>
                )}
                {loading && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '5px',
                        }}
                    >
                        <CircularProgress />
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="text">
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handleClick} variant="outlined">
                    <FormattedMessage id="export" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ExportDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    studyName: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
};

/**
 * Dialog to change the access rights of a study #TODO To be moved in the common-ui repository once it has been created
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param studyName the name of the study to export
 * @param userId the name of the logged in user
 * @param {String} title Title of the dialog
 * @param {String} isPrivate tells if the study is private or not
 */
const AccessRightsDialog = ({
    open,
    onClose,
    studyName,
    userId,
    title,
    isPrivate,
}) => {
    const [loading, setLoading] = React.useState(false);

    const [selected, setSelected] = React.useState(
        isPrivate !== null ? isPrivate.toString() : null
    );

    const [error, setError] = React.useState('');

    const dispatch = useDispatch();

    const useStyles = makeStyles(() => ({
        formControl: {
            minWidth: 300,
        },
    }));

    const handleClick = () => {
        setLoading(true);
        changeStudyAccessRights(studyName, userId, selected).then(
            (response) => {
                response.ok
                    ? fetchStudies().then((studies) => {
                          dispatch(loadStudiesSuccess(studies));
                          onClose();
                      })
                    : setError(
                          intl.formatMessage({ id: 'modifyAccessRightsError' })
                      );
            }
        );
        setLoading(false);
    };

    const handleClose = () => {
        onClose();
        setLoading(false);
        setError('');
    };

    const handleExited = () => {
        onClose();
        setLoading(false);
        setError('');
    };

    const handleChange = (event) => {
        setSelected(event.target.value);
    };

    const classes = useStyles();
    const intl = useIntl();

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            onExited={handleExited}
            aria-labelledby="dialog-title-accessRights"
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <FormControl className={classes.formControl}>
                    <RadioGroup
                        aria-label=""
                        name="studyAccessRights"
                        value={selected}
                        onChange={handleChange}
                        row
                    >
                        <FormControlLabel
                            value="false"
                            control={<Radio />}
                            label=<FormattedMessage id="public" />
                        />
                        <FormControlLabel
                            value="true"
                            control={<Radio />}
                            label=<FormattedMessage id="private" />
                        />
                    </RadioGroup>
                    {error !== '' && <Alert severity="error">{error}</Alert>}
                </FormControl>
                {loading && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '5px',
                        }}
                    >
                        <CircularProgress />
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="text">
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handleClick} variant="outlined">
                    <FormattedMessage id="edit" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AccessRightsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    studyName: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isPrivate: PropTypes.string.isRequired,
};

export { DeleteDialog, RenameDialog, ExportDialog, AccessRightsDialog };
