/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useCSVReader } from 'react-papaparse';
import Button from '@mui/material/Button';
import React, { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
import CsvDownloader from 'react-csv-downloader';
import Alert from '@mui/material/Alert';
import PropTypes from 'prop-types';
import { DialogContentText } from '@mui/material';
import { useWatch } from 'react-hook-form';
import { AG_GRID_ROW_UUID } from '../../../field-constants';

const CsvUploader = ({
    name,
    onClose,
    open,
    title,
    fileHeaders,
    fileName,
    csvData,
    validateData = (rows) => true,
    getDataFromCsv,
    useFieldArrayOutput,
}) => {
    const watchTableValues = useWatch({ name });
    const { append, replace } = useFieldArrayOutput;
    const [createError, setCreateError] = React.useState('');
    const intl = useIntl();
    const { CSVReader } = useCSVReader();
    const [importedData, setImportedData] = useState([]);
    const [isConfirmationPopupOpen, setOpenConfirmationPopup] = useState(false);

    const data = useMemo(() => {
        const data = [...[fileHeaders]];
        if (Array.isArray(csvData)) {
            csvData.forEach((row) => data.push([row]));
        }
        return data;
    }, [csvData, fileHeaders]);
    const handleClose = () => {
        onClose();
        setCreateError('');
    };

    const validateCsvFile = (rows) => {
        if (rows.length === 0) {
            setCreateError(intl.formatMessage({ id: 'noDataInCsvFile' }));
            return false;
        }

        // validate the headers
        for (let i = 0; i < fileHeaders.length; i++) {
            if (fileHeaders[i] !== '' && rows[0][i] !== fileHeaders[i]) {
                setCreateError(
                    intl.formatMessage({ id: 'wrongCsvHeadersError' })
                );
                return false;
            }
        }

        return validateData(rows);
    };

    const getResultsFromImportedData = () => {
        return importedData.filter((row) => {
            // We do not keep the comment rows
            if (row[0].startsWith('#')) {
                return false;
            }
            // We keep the row if at least one of its column has a value
            return row.some((column) => !!column?.trim());
        });
    };

    const handleFileSubmit = (keepTableValues) => {
        if (importedData.length !== 0) {
            const result = getResultsFromImportedData();
            if (validateCsvFile(result)) {
                result.splice(0, 1);
                const dataFromCsv = getDataFromCsv(result);

                if (keepTableValues) {
                    append(dataFromCsv);
                } else {
                    replace(dataFromCsv);
                }

                handleClose();
            }
        } else {
            setCreateError(intl.formatMessage({ id: 'noDataInCsvFile' }));
        }
    };

    const handleOpenCSVConfirmationDataDialog = () => {
        // We check if there are values in the table
        const isValuesInTable =
            Array.isArray(watchTableValues) &&
            watchTableValues.some(
                (val) =>
                    val &&
                    Object.keys(val)
                        .filter((key) => key !== AG_GRID_ROW_UUID)
                        .some(
                            (e) =>
                                val[e] !== undefined &&
                                val[e] !== null &&
                                String(val[e]).trim().length > 0
                        )
            );

        if (isValuesInTable && getResultsFromImportedData().length > 0) {
            setOpenConfirmationPopup(true);
        } else {
            setOpenConfirmationPopup(false);
            handleFileSubmit(false);
        }
    };

    const handleAddPopupConfirmation = () => {
        handleFileSubmit(true);
        setOpenConfirmationPopup(false);
    };

    const handleReplacePopupConfirmation = () => {
        handleFileSubmit(false);
        setOpenConfirmationPopup(false);
    };

    const handleCancelDialog = () => {
        setOpenConfirmationPopup(false);
    };
    const renderConfirmationCsvData = () => {
        return (
            <Dialog
                open={isConfirmationPopupOpen}
                aria-labelledby="dialog-confirmation-csv-data"
            >
                <DialogTitle id={'dialog-confirmation-csv-data'}>
                    {'Confirmation'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {intl.formatMessage({ id: 'keepCSVDataMessage' })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCancelDialog()}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button onClick={() => handleReplacePopupConfirmation()}>
                        <FormattedMessage id="replace" />
                    </Button>
                    <Button
                        onClick={() => handleAddPopupConfirmation()}
                        variant="outlined"
                    >
                        <FormattedMessage id="add" />
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <div>
                        <Grid container spacing={2}>
                            <Grid container item>
                                <Grid item xs={6}>
                                    <CsvDownloader
                                        datas={data}
                                        filename={fileName}
                                        separator={','}
                                    >
                                        <Button variant={'contained'}>
                                            <FormattedMessage id="GenerateCSV" />
                                        </Button>
                                    </CsvDownloader>
                                </Grid>
                            </Grid>
                            <Grid container item spacing={3}>
                                <CSVReader
                                    onUploadAccepted={(results) => {
                                        setImportedData([...results.data]);
                                        setCreateError('');
                                    }}
                                >
                                    {({ getRootProps, acceptedFile }) => (
                                        <>
                                            <Grid item>
                                                <Button
                                                    {...getRootProps()}
                                                    variant={'contained'}
                                                >
                                                    <FormattedMessage id="UploadCSV" />
                                                </Button>
                                                <span
                                                    style={{
                                                        marginLeft: '10px',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {acceptedFile
                                                        ? acceptedFile.name
                                                        : intl.formatMessage({
                                                              id: 'uploadMessage',
                                                          })}
                                                </span>
                                            </Grid>
                                        </>
                                    )}
                                </CSVReader>
                            </Grid>
                        </Grid>
                        {createError !== '' && (
                            <Alert severity="error">{createError}</Alert>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleOpenCSVConfirmationDataDialog()}
                        disabled={createError !== ''}
                    >
                        <FormattedMessage id="validate" />
                    </Button>
                </DialogActions>
            </Dialog>
            {renderConfirmationCsvData()}
        </>
    );
};

CsvUploader.prototype = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    title: PropTypes.string,
    equipmentType: PropTypes.any,
};

export default CsvUploader;
