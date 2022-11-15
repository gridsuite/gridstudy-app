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
    DialogTitle,
    Grid,
} from '@mui/material';
import { useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useCSVReader } from '../inputs/input-hooks';
import CsvDownloader from 'react-csv-downloader';
import { PHASE_TAP } from './two-windings-transformer-creation-dialog';

export const ImportRuleDialog = (props) => {
    const handleCloseDialog = () => {
        props.setOpenImportRuleDialog(false);
    };

    const [selectedFile, setSelectedFile, FileField, selectedFileError] =
        useCSVReader({
            label:
                props.ruleType === PHASE_TAP
                    ? 'ImportDephasingRule'
                    : 'ImportRegulationRule',
            header: props.csvColumns,
        });

    const handleSave = () => {
        if (!selectedFileError) {
            props.handleImportTapRule(selectedFile);
            handleCloseDialog();
        }
    };

    useEffect(() => {
        if (props.openImportRuleDialog) {
            setSelectedFile();
        }
    }, [props.openImportRuleDialog, setSelectedFile]);

    const isInvalid = useCallback(() => {
        return (
            typeof selectedFile === 'undefined' ||
            typeof selectedFileError !== 'undefined'
        );
    }, [selectedFile, selectedFileError]);

    return (
        <Dialog open={props.openImportRuleDialog} fullWidth={true}>
            <DialogTitle>
                <FormattedMessage
                    id={
                        props.ruleType === PHASE_TAP
                            ? 'ImportDephasingRule'
                            : 'ImportRegulationRule'
                    }
                />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction={'column'}>
                    <Grid item>
                        <CsvDownloader
                            columns={props.csvColumns}
                            filename={
                                props.ruleType === PHASE_TAP
                                    ? 'tap-dephasing-rule'
                                    : 'tap-regulating-rule'
                            }
                        >
                            <Button variant="contained">
                                <FormattedMessage id="GenerateSkeleton" />
                            </Button>
                        </CsvDownloader>
                    </Grid>
                    <Grid item>{FileField}</Grid>
                    {selectedFile && selectedFileError && (
                        <Grid item>
                            <Alert severity="error">{selectedFileError}</Alert>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button disabled={isInvalid()} onClick={handleSave}>
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
