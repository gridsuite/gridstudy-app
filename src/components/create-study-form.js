/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';

import {makeStyles} from "@material-ui/core/styles";
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

import {createStudy, fetchCases, fetchStudies} from '../utils/rest-api';
import {useIntl, FormattedMessage} from "react-intl";

import {useDispatch, useSelector} from "react-redux";
import {loadStudiesSuccess, loadCasesSuccess, selectedCase, removeSelectedCase} from "../redux/actions";
import {store} from '../redux/store';

const useStyles = makeStyles(theme => ({
    addButton: {
        margin: theme.spacing(2),
    },
    addIcon: {
        marginRight: theme.spacing(1),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    }
}));

const SelectCase = () => {
    const [openSelectCase, setSelectCase] = React.useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        fetchCases()
            .then(cases => {
                dispatch(loadCasesSuccess(cases));
            });
    }, []);

    const cases = useSelector(state => state.cases);

    const handleChangeSelectCase = event => {
        dispatch(selectedCase(event.target.value));
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
                   <FormattedMessage id="caseName"/>
               </InputLabel>
               <Select
                   labelId="demo-controlled-open-select-label"
                   id="demo-controlled-open-select"
                   open={openSelectCase}
                   onClose={handleCloseSelectCase}
                   onOpen={handleOpenSelectCase}
                   value={store.getState().selectedCase != null ? store.getState().selectedCase : ""}
                   onChange={handleChangeSelectCase}>
                   {
                       cases.map((function (element, index) {return <MenuItem key={element.name} value={element.name}>{element.name}</MenuItem>}))
                   }
               </Select>
           </FormControl>
        </div>
    );
};

export const CreateStudyForm = () => {
    const dispatch = useDispatch();

    const [open, setOpen] = React.useState(false);
    const [caseExist, setCaseExist] = React.useState(false);

    const [studyName, setStudyeName] = React.useState('');
    const [studyDescription, setStudyDescription] = React.useState('');

    const [fileName, setFileName] = React.useState('');

    const [selectedFile, setSelectedFile] = React.useState('');
    const [err, setErr] = React.useState('');
    const [success, setSuccess] = React.useState('');

    const [loading, setLoading] = React.useState(false);

    const classes = useStyles();
    const intl = useIntl();

    const handleClickOpenDialog = () => {
        setOpen(true);
    };

        const handleCloseDialog = () => {
            setOpen(false);
            setSuccess('');
            setErr('');
        };

    const handleChangeSwitch = (e) => {
        setCaseExist(e.target.checked);
        setErr('');
    };

    const handleStudyDescriptionChanges = (e) => {
        setStudyDescription(e.target.value)
    }

    const handleStudyNameChanges = (e) => {
        setStudyeName(e.target.value)
    }

    const checkFileExtension = (event) => {
        //getting file object
        let files = event.target.files
        let fileExtension = files[0].name.split('.').pop().toUpperCase();

        // list allowed extensions
        const extensions = ['XIIDM', 'CGMES', 'UCTE', 'IEEE-CDF']

        // compare file extension find doesn't match
        if (extensions.every(type => fileExtension !== type)) {
            // create error message
            setErr(fileExtension + intl.formatMessage({id : 'fileExtensionErrorMsg'}));
            setFileName(intl.formatMessage({id : 'uploadMessage'}));
            event.target.value = null // discard selected file
            return false;
        }
        setFileName(files[0].name);
        return true;
    }

    const handleCreateNewStudy = () => {
        const caseName = store.getState().selectedCase;
        if (studyName === '') {
            setErr(intl.formatMessage({id : 'studyNameErrorMsg'}));
            return;
        } else if (studyDescription === '') {
            setErr(intl.formatMessage({id : 'studyDescriptionErrorMsg'}));
            return;
        } else if (caseExist && caseName === null) {
            setErr(intl.formatMessage({id : 'caseNameErrorMsg'}));
            return;
        } else if (!caseExist && fileName === '') {
            setErr(intl.formatMessage({id : 'uploadErrorMsg'}));
            return;
        }
        setLoading(true);
        createStudy(caseExist, studyName, studyDescription, caseName, selectedFile)
            .then(res => {
                if(res.ok) {
                    setErr('');
                    setStudyeName('');
                    setStudyDescription('');
                    setFileName('')
                    dispatch(removeSelectedCase());
                    setSuccess (intl.formatMessage({id : 'studyCreated'}));
                    setLoading(false);
                    fetchStudies()
                        .then(studies => {
                            dispatch(loadStudiesSuccess(studies));
                        })
                } else {
                    console.log('Error when creating the study')
                    setErr(intl.formatMessage({id : 'studyCreatingError'}));
                    setLoading(false);
                }
            });
    };

    const handleFileUpload = (e) => {
        e.preventDefault()
        let files = e.target.files;
        let reader = new FileReader()
        reader.readAsDataURL(files[0])
        setSelectedFile(files[0])
        checkFileExtension(e);
    }

    return (
        <div>
            <Button variant="contained" color="primary" className={classes.addButton} onClick={() => handleClickOpenDialog() }>
                <AddIcon className={classes.addIcon}/>
                <FormattedMessage id="newStudy"/>
            </Button>

            <Dialog open={open} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title"><FormattedMessage id="addNewStudy"/></DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage id="addNewStudyDescription"/>
                    </DialogContentText>
                    <FormControlLabel
                        control = {<Switch
                            checked={caseExist}
                            onChange={(e) => handleChangeSwitch(e)}
                            value="checked"
                            color="primary"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                        }
                        label = <FormattedMessage id="CaseExist"/>
                    />
                    <TextField
                        onChange={(e) => handleStudyNameChanges(e)}
                        autoFocus
                        margin="dense"
                        id="name"
                        value={studyName}
                        label= <FormattedMessage id="studyName"/>
                    type="text"
                    fullWidth
                    />
                    <TextField
                        onChange={(e) => handleStudyDescriptionChanges(e)}
                        autoFocus
                        margin="dense"
                        id="name"
                        value={studyDescription}
                        label= <FormattedMessage id="studyDescription"/>
                    type="text"
                    fullWidth
                    />

                    {   caseExist && (
                            <SelectCase/>
                        )
                    }

                    {
                        !caseExist &&
                        (
                            <table>
                                <tbody>
                                <tr>
                                    <th>
                                        <Button  variant="contained" color="primary"  component="label" >
                                            <FormattedMessage id="uploadCase"/>
                                            <input
                                                type="file"
                                                name="file"
                                                onChange={(e) => handleFileUpload(e)}
                                                style={{ display: "none" }}
                                            />
                                        </Button>
                                    </th>
                                    <th>
                                       <p>{fileName === '' ? <FormattedMessage id="uploadMessage"/> : fileName}</p>
                                    </th>
                                </tr>
                                 </tbody>
                            </table>
                        )
                    }
                    { err !== '' && (
                      <Alert severity="error">{err}</Alert>
                    )
                    }
                    { success !== '' && (
                        <Alert severity="success">{success}</Alert>
                        )
                    }
                    { loading && (
                         <div style={{display: 'flex', justifyContent: 'center'}}>
                            <CircularProgress className={classes.progress}/>
                        </div>
                        )
                    }
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        <FormattedMessage id="cancel"/>
                    </Button>
                    <Button onClick={handleCreateNewStudy} color="primary">
                        <FormattedMessage id="create"/>
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};

export default CreateStudyForm;
