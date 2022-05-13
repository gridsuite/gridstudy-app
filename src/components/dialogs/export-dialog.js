/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Dialog,
    DialogTitle,
    Grid,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { getAvailableExportFormats, getExportUrl } from '../../utils/rest-api';

/**
 * Dialog to export the network case
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the export
 * @param {String} studyUuid the uuid of the study to export
 * @param {String} nodeUuid the uuid of the selected node
 * @param {String} title Title of the dialog
 */

const ExportDialog = ({
    open,
    onClose,
    onClick,
    studyUuid,
    nodeUuid,
    title,
}) => {
    const [availableFormats, setAvailableFormats] = React.useState('');
    const [formatsWithParameters, setFormatsWithParameters] = useState([]);
    const [selectedFormat, setSelectedFormat] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [downloadUrl, setDownloadUrl] = React.useState('');
    const [exportStudyErr, setExportStudyErr] = React.useState('');

    useEffect(() => {
        if (open) {
            getAvailableExportFormats().then((formats) => {
                console.log('available formats :', formats);
                if (Array.isArray(formats)) {
                    setAvailableFormats(formats);
                } else if (typeof formats === 'object') {
                    setAvailableFormats(Object.keys(formats));
                    setFormatsWithParameters(formats);
                }
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
        setSelectedFormat('');
        setLoading(false);
        setDownloadUrl('');
        onClose();
    };

    const handleChange = (event) => {
        let selected = event.target.value;
        setSelectedFormat(selected);
        setDownloadUrl(getExportUrl(studyUuid, nodeUuid, selected));
    };

    const intl = useIntl();

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-title-export"
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={10} align="start">
                        <FormControl fullWidth size="small">
                            <InputLabel
                                id="select-format-label"
                                margin={'dense'}
                                variant={'filled'}
                            >
                                <FormattedMessage id="exportFormat" />
                            </InputLabel>
                            <Select
                                labelId="select-format-label"
                                label={<FormattedMessage id="exportFormat" />}
                                variant="filled"
                                id="controlled-select-format"
                                onChange={handleChange}
                                defaultValue=""
                                inputProps={{
                                    id: 'select-format',
                                }}
                            >
                                {availableFormats !== '' &&
                                    availableFormats.map(function (element) {
                                        return (
                                            <MenuItem
                                                key={element}
                                                value={element}
                                            >
                                                {element}
                                            </MenuItem>
                                        );
                                    })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Parameters</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>plop</Typography>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
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
                <Button onClick={handleClose}>
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
    studyUuid: PropTypes.string,
    nodeUuid: PropTypes.string,
    title: PropTypes.string.isRequired,
};

export default ExportDialog;
