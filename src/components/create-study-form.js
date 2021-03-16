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

import { createStudy, fetchCases, studyExists } from '../utils/rest-api';
import { FormattedMessage, useIntl } from 'react-intl';

import { useDispatch, useSelector } from 'react-redux';
import {
    loadCasesSuccess,
    removeSelectedFile,
    selectCase,
    selectFile,
} from '../redux/actions';
import { store } from '../redux/store';
import CardActionArea from '@material-ui/core/CardActionArea';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

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
        // Note: dispatch doesn't change
    }, [dispatch]);

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

export const CreateStudyForm = (props) => {
    const [open, setOpen] = React.useState(false);
    const [caseExist, setCaseExist] = React.useState(false);

    const [studyName, setStudyName] = React.useState('');
    const [studyDescription, setStudyDescription] = React.useState('');
    const [studyPrivacy, setStudyPrivacy] = React.useState('private');
    const [createStudyErr, setCreateStudyErr] = React.useState('');

    const [studyInvalid, setStudyInvalid] = useState(false);
    const [loadingCheckStudyName, setLoadingCheckStudyName] = React.useState(
        false
    );
    const [studyNameChecked, setStudyNameChecked] = React.useState(false);

    const userId = useSelector((state) => state.user.profile.sub);

    const timer = React.useRef();

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

    const handleStudyNameChanges = (e) => {
        const name = e.target.value;
        setStudyName(name);

        setStudyNameChecked(false);
        setLoadingCheckStudyName(true);

        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            updateStudyFormState(name, userId);
        }, 700);
    };

    const updateStudyFormState = (inputValue, userId) => {
        if (inputValue !== '') {
            studyExists(inputValue, userId)
                .then((data) => {
                    if (data === true) {
                        setStudyFormState(
                            intl.formatMessage({
                                id: 'studyNameAlreadyUsed',
                            }),
                            false
                        );
                    } else if (data === false) {
                        setStudyFormState('', true);
                    } else {
                        setCreateStudyErr(
                            intl.formatMessage({
                                id: 'nameValidityCheckErrorMsg',
                            }) +
                                data.status +
                                ' (' +
                                data.error +
                                ')'
                        );
                    }
                })
                .catch((error) => {
                    setCreateStudyErr(
                        intl.formatMessage({
                            id: 'nameValidityCheckErrorMsg',
                        }) + error
                    );
                });
        } else {
            setStudyFormState('', false);
        }
        setLoadingCheckStudyName(false);
    };

    const setStudyFormState = (errorMessage, isNameValid) => {
        setCreateStudyErr(errorMessage);
        setStudyInvalid(!isNameValid);
        setStudyNameChecked(isNameValid);
    };

    const handleChangeStudyPrivacy = (event) => {
        setStudyPrivacy(event.target.value);
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

        let isPrivateStudy = studyPrivacy === 'private';

        setOpen(false);
        props.addCreationRequest({
            studyName: studyName,
            userId: userId,
            isPrivate: isPrivateStudy,
            creationDate: Date.now(),
        });
        createStudy(
            caseExist,
            studyName,
            studyDescription,
            caseName,
            selectedFile,
            isPrivateStudy
        ).then((res) => {
            setCreateStudyErr('');
            setStudyName('');
            setStudyDescription('');
            dispatch(removeSelectedFile());

            if (!res.ok) {
                console.debug('Error when creating the study');
                if (res.status === 409) {
                    setCreateStudyErr(
                        intl.formatMessage({ id: 'studyNameAlreadyUsed' })
                    );
                } else {
                    res.json()
                        .then((data) => {
                            setCreateStudyErr(data.message);
                        })
                        .catch((error) => {
                            setCreateStudyErr(error);
                        });
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
                    <div>
                        <TextField
                            onChange={(e) => handleStudyNameChanges(e)}
                            autoFocus
                            margin="dense"
                            value={studyName}
                            type="text"
                            error={studyInvalid}
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
                        {studyNameChecked && (
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
                        style={{ width: '90%' }}
                        label=<FormattedMessage id="studyDescription" />
                    />

                    <RadioGroup
                        aria-label=""
                        name="studyPrivacy"
                        value={studyPrivacy}
                        onChange={handleChangeStudyPrivacy}
                        row
                    >
                        <FormControlLabel
                            value="public"
                            control={<Radio />}
                            label=<FormattedMessage id="public" />
                        />
                        <FormControlLabel
                            value="private"
                            control={<Radio />}
                            label=<FormattedMessage id="private" />
                        />
                    </RadioGroup>
                    {caseExist && <SelectCase />}
                    {!caseExist && <UploadCase />}
                    {createStudyErr !== '' && (
                        <Alert severity="error">{createStudyErr}</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCloseDialog()} variant="text">
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        onClick={() => handleCreateNewStudy()}
                        disabled={studyInvalid}
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
