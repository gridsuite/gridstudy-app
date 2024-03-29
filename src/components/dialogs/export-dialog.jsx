/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Collapse,
    Dialog,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { CancelButton, FlatParameters } from '@gridsuite/commons-ui';
import { getAvailableExportFormats } from '../../services/study';
import { getExportUrl } from '../../services/study/network';
import { CGMES } from 'components/utils/constants';

const STRING_LIST = 'STRING_LIST';

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
    const [formatsWithParameters, setFormatsWithParameters] = useState([]);
    const [selectedFormat, setSelectedFormat] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [exportStudyErr, setExportStudyErr] = React.useState('');

    const [unfolded, setUnfolded] = React.useState(false);

    useEffect(() => {
        if (open) {
            getAvailableExportFormats().then((formats) => {
                // we check if the param is for extension, if it is, we select all possible values by default.
                // the only way for the moment to check if the param is for extension, is by checking his type is name.
                //TODO to be removed when extensions param default value corrected in backend to include all possible values
                Object.values(formats).forEach((f) => {
                    f.parameters = f.parameters.map((parameter) => {
                        if (
                            parameter.type === STRING_LIST &&
                            parameter.name?.endsWith('extensions')
                        ) {
                            parameter.defaultValue = parameter.possibleValues;
                        }
                        return parameter;
                    });
                });
                setFormatsWithParameters(formats);
            });
        }
    }, [open]);

    const handleFoldChange = () => {
        setUnfolded((prev) => !prev);
    };

    const formatWithParameter = formatsWithParameters?.[selectedFormat];
    const metasAsArray = formatWithParameter?.parameters || [];
    const [currentParameters, setCurrentParameters] = useState({});
    const onChange = useCallback((paramName, value, isEdit) => {
        if (!isEdit) {
            setCurrentParameters((prevCurrentParameters) => {
                return {
                    ...prevCurrentParameters,
                    ...{ [paramName]: value },
                };
            });
        }
    }, []);
    const handleExportClick = () => {
        if (selectedFormat) {
            const downloadUrl = getExportUrl(
                studyUuid,
                nodeUuid,
                selectedFormat
            );
            let suffix;
            if (Object.keys(currentParameters).length > 0) {
                const urlSearchParams = new URLSearchParams();
                const jsoned = JSON.stringify(currentParameters);
                urlSearchParams.append('formatParameters', jsoned);
                // we have already as parameters, the tokens, so use '&' in stead of '?'
                suffix = '&' + urlSearchParams.toString();
            }

            setLoading(true);
            onClick(downloadUrl + (suffix ? suffix : ''));
        } else {
            setExportStudyErr(
                intl.formatMessage({ id: 'exportStudyErrorMsg' })
            );
        }
    };

    const handleClose = () => {
        setCurrentParameters({});
        setExportStudyErr('');
        setSelectedFormat('');
        setLoading(false);
        onClose();
    };

    const handleFormatSelectionChange = (event) => {
        let selected = event.target.value;
        setSelectedFormat(selected);
    };

    const intl = useIntl();

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-title-export"
        >
            <DialogTitle>
                {title}
                <div style={{ marginTop: '0.8em' }} />
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
                        onChange={handleFormatSelectionChange}
                        defaultValue=""
                        inputProps={{
                            id: 'select-format',
                        }}
                    >
                        {Object.keys(formatsWithParameters)
                            .filter(
                                (format) =>
                                    // Hide the CGMES item while waiting for the Fix of getIdentifiable on the back end
                                    format !== CGMES
                            )
                            .map((formatKey) => (
                                <MenuItem key={formatKey} value={formatKey}>
                                    {formatKey}
                                </MenuItem>
                            ))}
                    </Select>
                    <Stack
                        marginTop="0.7em"
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography
                            component="span"
                            color={
                                selectedFormat ? 'text.main' : 'text.disabled'
                            }
                            style={{ fontWeight: 'bold' }}
                        >
                            <FormattedMessage id="parameters" />
                        </Typography>
                        <IconButton
                            onClick={handleFoldChange}
                            disabled={!selectedFormat}
                        >
                            {unfolded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Stack>
                </FormControl>
            </DialogTitle>
            <DialogContent>
                <Collapse in={unfolded}>
                    <FlatParameters
                        paramsAsArray={metasAsArray}
                        initValues={currentParameters}
                        onChange={onChange}
                        variant="standard"
                        selectionWithDialog={(param) =>
                            param?.possibleValues?.length > 10
                        }
                    />
                </Collapse>
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
                <CancelButton onClick={handleClose} />
                <Button
                    onClick={handleExportClick}
                    variant="outlined"
                    disabled={!selectedFormat}
                >
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
