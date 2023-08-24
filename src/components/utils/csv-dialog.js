/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';

import CsvDownloader from 'react-csv-downloader';
import { PHASE_TAP } from '../dialogs/network-modifications/two-windings-transformer/creation/two-windings-transformer-creation-dialog';
import { MAX_ROWS_NUMBER } from 'components/utils/dnd-table/dnd-table';
import { useIntl } from 'react-intl';
import {
    DISTRIBUTION_KEY,
    EQUIPMENT_ID,
    FILTER_EQUIPMENTS_ATTRIBUTES,
} from 'components/dialogs/filter/creation/explicit-naming/explicit-naming-filter-form';
import { useFormContext } from 'react-hook-form';

export const CsvDialog = (props) => {
    const intl = useIntl();
    const { getValues } = useFormContext();
    const [isAddOrReplaceDialogOpen, setIsAddOrReplaceDialogOpen] =
        useState(false);
    const isTableHasValues = () => {
        return getValues(FILTER_EQUIPMENTS_ATTRIBUTES).some(
            (row) => row[DISTRIBUTION_KEY] || row[EQUIPMENT_ID]
        );
    };
    const handleCloseDialog = () => {
        props.setOpenCsvDialog(false);
    };

    const labelButtonId =
        props.ruleType === undefined
            ? 'ImportCSV'
            : props.ruleType === PHASE_TAP
            ? 'ImportDephasingRule'
            : 'ImportRegulationRule';

    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: labelButtonId,
        header: props.csvColumns,
        resetTrigger: props.openCsvDialog,
        maxTapNumber: MAX_ROWS_NUMBER,
    });

    const handleSave = (keepTableValues) => {
        if (!selectedFileError) {
            props.handleImportCsv(selectedFile, keepTableValues);
            handleCloseDialog();
        }
    };

    const isInvalid = useMemo(() => {
        return (
            typeof selectedFile === 'undefined' ||
            typeof selectedFileError !== 'undefined'
        );
    }, [selectedFile, selectedFileError]);

    const handleAddPopupConfirmation = () => {
        handleSave(true);
        setIsAddOrReplaceDialogOpen(false);
    };

    const handleReplacePopupConfirmation = () => {
        handleSave(false);
        setIsAddOrReplaceDialogOpen(false);
    };

    const handleCancelDialog = () => {
        setIsAddOrReplaceDialogOpen(false);
    };

    const handleOpenAddOrReplaceDialog = () => {
        if (isTableHasValues()) {
            setIsAddOrReplaceDialogOpen(true);
        } else {
            handleSave(false);
        }
    };

    const renderConfirmationCsvData = () => {
        return (
            <Dialog
                open={isAddOrReplaceDialogOpen}
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
                        <FormattedMessage id="Replace" />
                    </Button>
                    <Button
                        onClick={() => handleAddPopupConfirmation()}
                        variant="outlined"
                    >
                        <FormattedMessage id="AddRows" />
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <>
            <Dialog open={props.openCsvDialog} fullWidth={true}>
                <DialogTitle>
                    <FormattedMessage id={props.title} />
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} direction={'column'}>
                        <Grid item>
                            <CsvDownloader
                                columns={props.csvColumns}
                                datas={[]}
                                filename={props.fileName}
                            >
                                <Button variant="contained">
                                    <FormattedMessage id="GenerateSkeleton" />
                                </Button>
                            </CsvDownloader>
                        </Grid>
                        <Grid item>{FileField}</Grid>
                        {selectedFile && selectedFileError && (
                            <Grid item>
                                <Alert severity="error">
                                    {selectedFileError}
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        disabled={isInvalid}
                        onClick={handleOpenAddOrReplaceDialog}
                    >
                        <FormattedMessage id="validate" />
                    </Button>
                </DialogActions>
            </Dialog>
            {renderConfirmationCsvData()}
        </>
    );
};
