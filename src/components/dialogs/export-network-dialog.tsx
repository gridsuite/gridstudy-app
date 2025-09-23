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
    InputLabel,
    Alert,
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
    IconButton,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CancelButton, FlatParameters, fetchDirectoryElementPath, useSnackMessage } from '@gridsuite/commons-ui';
import { ExportFormatProperties, getAvailableExportFormats } from '../../services/study';
import { getExportUrl } from '../../services/study/network';
import { isBlankOrEmpty } from 'components/utils/validation-functions';
import TextField from '@mui/material/TextField';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { useParameterState } from './parameters/use-parameters-state';
import { AppState } from '../../redux/reducer';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';

const STRING_LIST = 'STRING_LIST';

/**
 * Dialog to export the network case
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the export
 * @param {String} studyUuid the uuid of the study to export
 * @param {String} nodeUuid the uuid of the selected node
 */

interface ExportNetworkDialogProps {
    open: boolean;
    onClose: () => void;
    onClick: (url: string) => void;
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
}

export function ExportNetworkDialog({
    open,
    onClose,
    onClick,
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
}: Readonly<ExportNetworkDialogProps>) {
    const intl = useIntl();
    const [formatsWithParameters, setFormatsWithParameters] = useState<Record<string, ExportFormatProperties>>({});
    const [selectedFormat, setSelectedFormat] = useState('');
    const [loading, setLoading] = useState(false);
    const [exportStudyErr, setExportStudyErr] = useState('');
    const { snackError } = useSnackMessage();
    const [fileName, setFileName] = useState<string>();
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const [unfolded, setUnfolded] = useState(false);

    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const nodeName = useMemo(() => treeNodes?.find((node) => node.id === nodeUuid)?.data.label, [treeNodes, nodeUuid]);

    // fetch study name to build default file name
    useEffect(() => {
        if (studyUuid) {
            fetchDirectoryElementPath(studyUuid)
                .then((response) => {
                    const studyName = response[response.length - 1]?.elementName;
                    setFileName(`${studyName}_${nodeName}`);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'LoadStudyAndParentsInfoError',
                    });
                });
        }
    }, [studyUuid, nodeName, snackError]);

    useEffect(() => {
        if (open) {
            getAvailableExportFormats().then((formats) => {
                const XIIDM_FORMAT = 'XIIDM';
                const availableFormats = enableDeveloperMode
                    ? formats
                    : Object.fromEntries(Object.entries(formats).filter(([key]) => key === XIIDM_FORMAT));
                // we check if the param is for extension, if it is, we select all possible values by default.
                // the only way for the moment to check if the param is for extension, is by checking his type is name.
                //TODO to be removed when extensions param default value corrected in backend to include all possible values
                Object.values(availableFormats).forEach((format) => {
                    format.parameters = format.parameters.map((parameter) => {
                        if (parameter.type === STRING_LIST && parameter.name?.endsWith('extensions')) {
                            parameter.defaultValue = parameter.possibleValues;
                        }
                        return parameter;
                    });
                });
                setFormatsWithParameters(availableFormats);
            });
        }
    }, [open, enableDeveloperMode]);

    const handleFoldChange = () => {
        setUnfolded((prev) => !prev);
    };

    const formatWithParameter = formatsWithParameters?.[selectedFormat];
    const metasAsArray = formatWithParameter?.parameters || [];
    const [currentParameters, setCurrentParameters] = useState({});
    const onChange = useCallback((paramName: string, value: unknown, isInEdition: boolean) => {
        if (!isInEdition) {
            setCurrentParameters((prevCurrentParameters) => {
                return {
                    ...prevCurrentParameters,
                    ...{ [paramName]: value },
                };
            });
        }
    }, []);
    const handleExportClick = () => {
        if (fileName && selectedFormat) {
            const downloadUrl = getExportUrl(studyUuid, nodeUuid, rootNetworkUuid, selectedFormat);
            let suffix;
            const urlSearchParams = new URLSearchParams();
            if (Object.keys(currentParameters).length > 0) {
                const jsoned = JSON.stringify(currentParameters);
                urlSearchParams.append('formatParameters', jsoned);
            }
            if (!isBlankOrEmpty(fileName)) {
                urlSearchParams.append('fileName', fileName);
            }

            // we have already as parameters, the access tokens, so use '&' instead of '?'
            suffix = urlSearchParams.toString() ? '&' + urlSearchParams.toString() : '';
            setLoading(true);
            onClick(downloadUrl + suffix);
        } else {
            setExportStudyErr(intl.formatMessage({ id: 'exportStudyErrorMsg' }));
        }
    };

    const handleClose = () => {
        setCurrentParameters({});
        setExportStudyErr('');
        setSelectedFormat('');
        setLoading(false);
        onClose();
    };

    const handleFormatSelectionChange = (event: SelectChangeEvent) => {
        let selected = event.target.value;
        setSelectedFormat(selected);
    };

    return (
        <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="dialog-title-export">
            <DialogTitle>
                {intl.formatMessage({
                    id: 'exportNetwork',
                })}
            </DialogTitle>
            <DialogContent>
                <TextField
                    key="fileName"
                    margin="dense"
                    label={<FormattedMessage id="download.fileName" />}
                    id="fileName"
                    value={fileName}
                    sx={{ width: '100%', marginBottom: 1 }}
                    fullWidth
                    variant="filled"
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) => setFileName(event.target.value)}
                />
                <FormControl fullWidth size="small">
                    <InputLabel id="select-format-label" margin={'dense'} variant={'filled'}>
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
                        {Object.keys(formatsWithParameters).map((formatKey) => (
                            <MenuItem key={formatKey} value={formatKey}>
                                {formatKey}
                            </MenuItem>
                        ))}
                    </Select>
                    <Stack marginTop="0.7em" direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                            component="span"
                            color={selectedFormat ? 'text.main' : 'text.disabled'}
                            sx={{ fontWeight: 'bold' }}
                        >
                            <FormattedMessage id="parameters" />
                        </Typography>
                        <IconButton onClick={handleFoldChange} disabled={!selectedFormat}>
                            {unfolded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Stack>
                </FormControl>
                <Collapse in={unfolded}>
                    <FlatParameters
                        paramsAsArray={metasAsArray}
                        initValues={currentParameters}
                        onChange={onChange}
                        variant="standard"
                        selectionWithDialog={(param) => param?.possibleValues?.length > 10}
                    />
                </Collapse>
                {exportStudyErr !== '' && <Alert severity="error">{exportStudyErr}</Alert>}
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
                <Button onClick={handleExportClick} variant="outlined" disabled={!selectedFormat || !fileName}>
                    <FormattedMessage id="export" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
