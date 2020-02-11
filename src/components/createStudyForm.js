/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

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

import {createStudy} from '../utils/rest-api';
import {useIntl, FormattedMessage} from "react-intl";

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

export const CreateStudyForm = () => {
    const [open, setOpen] = React.useState(false);
    const [caseExist, setCaseExist] = React.useState(false);
    const [openSelectItems, setSelectItems] = React.useState(false);

    const [studyName, setStudyeName] = React.useState('');
    const [studyDescription, setStudyDescription] = React.useState('');

    const [caseName, setCaseName] = React.useState('');

    const [fileName, setFileName] = React.useState('');
    const [caseData, setCaseData] = React.useState('');

    const [err, setErr] = React.useState('');
    const [success, setSuccess] = React.useState('');

    const classes = useStyles();
    const intl = useIntl();

    const handleClickOpenButton = () => {
        setOpen(true);
    };

    const handleChangeSelectCase = event => {
        setCaseName(event.target.value)
    };

    const handleCloseSelectCase = () => {
        setSelectItems(false);
    };

    const handleOpenSelectCase = () => {
        setSelectItems(true);
    };

    const handleChangeSwitch = (e) => {
        setCaseExist(e.target.checked);
        setErr('');
    };

    const handleCloseDialog = () => {
        setOpen(false);
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
        if (studyName === '') {
            setErr(intl.formatMessage({id : 'studyNameErrorMsg'}));
            return;
        } else if (studyDescription === '') {
            setErr(intl.formatMessage({id : 'studyDescriptionErrorMsg'}));
            return;
        } else if (caseExist && caseName === "") {
            setErr(intl.formatMessage({id : 'caseNameErrorMsg'}));
            return;
        } else if (!caseExist && caseData === null) {
            setErr(intl.formatMessage({id : 'caseDataErrorMsg'}))
            return;
        }  else if (!caseExist && fileName === '') {
            setErr(intl.formatMessage({id : 'uploadErrorMsg'}));
            return;
        }

        if (createStudy(caseExist, studyName, studyDescription, caseName, caseData)) {
            setErr('');
            setStudyeName('');
            setStudyDescription('');
            setFileName('')
            setCaseName('')
            setCaseData('')
            setSuccess (intl.formatMessage({id : 'studyCreated'}));

        }
    };

    const handleFileUpload = (e) => {
        let files = e.target.files;
        let reader = new FileReader()
        reader.readAsDataURL(files[0])
        reader.onload = (event) => { setCaseData(event.target.result);};
        checkFileExtension(e);
    }

    return (
        <div>
            <Button variant="contained" color="primary" className={classes.addButton} onClick={() => handleClickOpenButton() }>
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
                        <div>
                            <FormControl className={classes.formControl} fullWidth>
                                <InputLabel id="demo-controlled-open-select-label">
                                    <FormattedMessage id="caseName"/>
                                </InputLabel>
                                <Select
                                    labelId="demo-controlled-open-select-label"
                                    id="demo-controlled-open-select"
                                    open={openSelectItems}
                                    onClose={handleCloseSelectCase}
                                    onOpen={handleOpenSelectCase}
                                    value={caseName}
                                    onChange={handleChangeSelectCase}
                                >
                                    <MenuItem value="case1.xiidm">case1.xiidm</MenuItem>
                                    <MenuItem value="case2.xiidm">case2.xiidm</MenuItem>
                                    <MenuItem value="case3.xiidm">case3.xiidm</MenuItem>
                                </Select>
                            </FormControl>
                        </div>)
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
                                       <p>{fileName == '' ? <FormattedMessage id="uploadMessage"/> : fileName}</p>
                                    </th>
                                </tr>
                                 </tbody>
                            </table>
                        )
                    }
                    { err != '' && (
                      <Alert severity="error">{err}</Alert>
                    )
                    }
                    { success != '' && (
                        <Alert severity="success">{success}</Alert>
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