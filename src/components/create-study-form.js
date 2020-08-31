/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
    createStudy,
    fetchCases,
    fetchStudies,
    studyExists,
} from '../utils/rest-api';
import { FormattedMessage, useIntl } from 'react-intl';

import { useDispatch, useSelector } from 'react-redux';
import {
    loadCasesSuccess,
    loadStudiesSuccess,
    removeSelectedFile,
    selectCase,
    selectFile,
} from '../redux/actions';
import { store } from '../redux/store';
import CardActionArea from '@material-ui/core/CardActionArea';

const useStyles = makeStyles(() => ({
    addIcon: {
        fontSize: '64px',
    },
    addButtonArea: {
        height: '136px',
    },
}));

const SelectCase = () => {
    const dispatch = useDispatch();
    const cases = useSelector((state) => state.cases);

    const [openSelectCase, setSelectCase] = React.useState(false);

    useEffect(() => {
        fetchCases().then((cases) => {
            dispatch(loadCasesSuccess(cases));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChangeSelectCase = (event) => {
        dispatch(selectCase(event.target.value));
    };

    const handleCloseSelectCase = () => {
        setSelectCase(false);
    };

    const handleOpenSelectCase = () => {
        setSelectCase(true);
    };

    return (
        <div>
            <FormControl fullWidth>
                <InputLabel id="demo-controlled-open-select-label">
                    <FormattedMessage id="caseName" />
                </InputLabel>
                <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    open={openSelectCase}
                    onClose={handleCloseSelectCase}
                    onOpen={handleOpenSelectCase}
                    value={
                        store.getState().selectedCase != null
                            ? store.getState().selectedCase
                            : ''
                    }
                    onChange={handleChangeSelectCase}
                >
                    {cases.map(function (element) {
                        return (
                            <MenuItem key={element.uuid} value={element.uuid}>
                                {element.name}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        </div>
    );
};

const UploadCase = () => {
    const dispatch = useDispatch();
    const selectedFile = useSelector((state) => state.selectedFile);

    const handleFileUpload = (e) => {
        e.preventDefault();
        let files = e.target.files;
        dispatch(selectFile(files[0]));
    };

    return (
        <table>
            <tbody>
                <tr>
                    <th>
                        <Button
                            variant="contained"
                            color="primary"
                            component="label"
                        >
                            <FormattedMessage id="uploadCase" />
                            <input
                                type="file"
                                name="file"
                                onChange={(e) => handleFileUpload(e)}
                                style={{ display: 'none' }}
                            />
                        </Button>
                    </th>
                    <th>
                        <p>
                            {selectedFile === null ? (
                                <FormattedMessage id="uploadMessage" />
                            ) : (
                                selectedFile.name
                            )}
                        </p>
                    </th>
                </tr>
            </tbody>
        </table>
    );
};

export const CreateStudyForm = () => {
    const [open, setOpen] = React.useState(false);
    const [caseExist, setCaseExist] = React.useState(false);

    const [studyName, setStudyName] = React.useState('');
    const [studyDescription, setStudyDescription] = React.useState('');
    const [createStudyErr, setCreateStudyErr] = React.useState('');

    const [loading, setLoading] = React.useState(false);
    const [createButtonDisable, setCreateButtonDisable] = useState(false);
    const [loadingCheckStudyName, setLoadingCheckStudyName] = React.useState(
        false
    );
    const [studyNameValid, setStudyNameValid] = React.useState(false);
    const [studyNameInputColor, setStudyNameInputColor] = React.useState(false);

    const classes = useStyles();
    const intl = useIntl();
    const dispatch = useDispatch();

    const selectedFile = useSelector((state) => state.selectedFile);
    const caseName = useSelector((state) => state.selectedCase);

    const handleClickOpenDialog = () => {
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setCreateStudyErr('');
    };

    const handleChangeSwitch = (e) => {
        setCaseExist(e.target.checked);
        setCreateStudyErr('');
    };

    const handleStudyDescriptionChanges = (e) => {
        setStudyDescription(e.target.value);
    };

    const getJsonData = async (resp) => {
        return new Promise((resolve) => {
            if (resp) {
                resp.json()
                    .then((json) => resolve(json))
                    .catch(() => resolve(null));
            } else {
                resolve(null);
            }
        });
    };

    const handleStudyNameChanges = (e) => {
        const name = e.target.value;
        setStudyName(name);

        clearTimeout(e.timeout);
        setStudyNameValid(false);
        setLoadingCheckStudyName(true);
        e.timeout = setTimeout(function () {
            if (name !== '') {
                studyExists(name).then((response) => {
                    if (response.ok) {
                        getJsonData(response).then((value) => {
                            if (value !== null) {
                                setStudyFormState(
                                    intl.formatMessage({
                                        id: 'studyNameAlreadyUsed',
                                    }),
                                    false
                                );
                            } else {
                                setStudyFormState('', true);
                            }
                        });
                    }
                });
            } else {
                setStudyNameValid(false);
            }
            setLoadingCheckStudyName(false);
        }, 700);
    };

    const setStudyFormState = (errorMessage, isNameValid) => {
        setCreateStudyErr(errorMessage);
        setCreateButtonDisable(!isNameValid);
        setStudyNameValid(isNameValid);
        isNameValid
            ? setStudyNameInputColor(false)
            : setStudyNameInputColor(true);
    };

    const handleCreateNewStudy = () => {
        if (studyName === '') {
            setCreateStudyErr(intl.formatMessage({ id: 'studyNameErrorMsg' }));
            return;
        } else if (caseExist && caseName === null) {
            setCreateStudyErr(intl.formatMessage({ id: 'caseNameErrorMsg' }));
            return;
        } else if (!caseExist && selectedFile === null) {
            setCreateStudyErr(intl.formatMessage({ id: 'uploadErrorMsg' }));
            return;
        }
        setLoading(true);
        createStudy(
            caseExist,
            studyName,
            studyDescription,
            caseName,
            selectedFile
        ).then((res) => {
            if (res.ok) {
                setCreateStudyErr('');
                setStudyName('');
                setStudyDescription('');
                dispatch(removeSelectedFile());
                setLoading(false);
                setOpen(false);
                fetchStudies().then((studies) => {
                    dispatch(loadStudiesSuccess(studies));
                });
            } else {
                console.info('Error when creating the study');
                if (res.status === 409) {
                    setCreateStudyErr(
                        intl.formatMessage({ id: 'studyNameAlreadyUsed' })
                    );
                } else if (res.status == 500) {
                    getJsonData(res).then((value) => {
                        setCreateStudyErr(value.message);
                    });
                    setLoading(false);
                }
            }
        });
    };

    const handleKeyPressed = (event) => {
        if (event.key === 'Enter') {
            handleCreateNewStudy();
        }
    };
    return (
        <div>
            <CardActionArea
                className={classes.addButtonArea}
                onClick={() => handleClickOpenDialog()}
            >
                <AddIcon className={classes.addIcon} />
            </CardActionArea>

            <Dialog
                open={open}
                onClose={handleCloseDialog}
                aria-labelledby="form-dialog-title"
                onKeyPress={handleKeyPressed}
            >
                <DialogTitle id="form-dialog-title">
                    <FormattedMessage id="addNewStudy" />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage id="addNewStudyDescription" />
                    </DialogContentText>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={caseExist}
                                onChange={(e) => handleChangeSwitch(e)}
                                value="checked"
                                color="primary"
                                inputProps={{
                                    'aria-label': 'primary checkbox',
                                }}
                            />
                        }
                        label=<FormattedMessage id="caseExist" />
                    />
                    <div style={{}}>
                        <TextField
                            onChange={(e) => handleStudyNameChanges(e)}
                            autoFocus
                            margin="dense"
                            value={studyName}
                            type="text"
                            error={studyNameInputColor}
                            style={{ width: '90%' }}
                            label=<FormattedMessage id="studyName" />
                        />
                        {loadingCheckStudyName && (
                            <div
                                style={{
                                    display: 'inline-block',
                                    verticalAlign: 'bottom',
                                }}
                            >
                                <CircularProgress
                                    className={classes.progress}
                                    size="1rem"
                                />
                            </div>
                        )}
                        {studyNameValid && (
                            <div
                                style={{
                                    display: 'inline-block',
                                    verticalAlign: 'bottom',
                                }}
                            >
                                <CheckIcon style={{ color: 'green' }} />
                            </div>
                        )}
                    </div>
                    <TextField
                        onChange={(e) => handleStudyDescriptionChanges(e)}
                        margin="dense"
                        value={studyDescription}
                        type="text"
                        //fullWidth
                        style={{ width: '90%' }}
                        label=<FormattedMessage id="studyDescription" />
                    />
                    {caseExist && <SelectCase />}
                    {!caseExist && <UploadCase />}
                    {createStudyErr !== '' && (
                        <Alert severity="error">{createStudyErr}</Alert>
                    )}
                    {loading && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <CircularProgress className={classes.progress} />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCloseDialog()} variant="text">
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        onClick={() => handleCreateNewStudy()}
                        disabled={createButtonDisable}
                        variant="outlined"
                    >
                        <FormattedMessage id="create" />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CreateStudyForm;
