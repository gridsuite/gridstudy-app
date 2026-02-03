/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import CsvDownloader from 'react-csv-downloader';
import { CancelButton, LANG_FRENCH, MAX_ROWS_NUMBER, useCSVPicker } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { PHASE_TAP, RuleType } from '../two-windings-transformer.types';
import { AppState } from 'redux/reducer';

export interface ImportRuleDialogProps {
    ruleType: RuleType;
    openImportRuleDialog: boolean;
    setOpenImportRuleDialog: (open: boolean) => void;
    csvColumns: string[];
    handleImportTapRule: (selectedFile: File, language: string, setFileParseError: (error: string) => void) => void;
}

export const ImportRuleDialog = ({
    ruleType,
    openImportRuleDialog,
    setOpenImportRuleDialog,
    csvColumns,
    handleImportTapRule,
}: ImportRuleDialogProps) => {
    const language = useSelector((state: AppState) => state.computedLanguage);

    const handleCloseDialog = () => {
        setOpenImportRuleDialog(false);
    };

    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: ruleType === PHASE_TAP ? 'ImportDephasingRule' : 'ImportRegulationRule',
        header: csvColumns,
        resetTrigger: openImportRuleDialog,
        maxTapNumber: MAX_ROWS_NUMBER,
        language: language,
    });

    const handleSave = () => {
        if (!selectedFileError) {
            handleImportTapRule(selectedFile!, language, () => {});
            handleCloseDialog();
        }
    };

    const isInvalid = useMemo(() => {
        return typeof selectedFile === 'undefined' || typeof selectedFileError !== 'undefined';
    }, [selectedFile, selectedFileError]);

    return (
        <Dialog open={openImportRuleDialog} fullWidth={true}>
            <DialogTitle>
                <FormattedMessage id={ruleType === PHASE_TAP ? 'ImportDephasingRule' : 'ImportRegulationRule'} />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction={'column'}>
                    <Grid item>
                        <CsvDownloader
                            columns={csvColumns}
                            datas={[]}
                            separator={language === LANG_FRENCH ? ';' : ','}
                            filename={ruleType === PHASE_TAP ? 'tap-dephasing-rule' : 'tap-regulating-rule'}
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
                <CancelButton onClick={handleCloseDialog} />
                <Button onClick={handleSave} variant="outlined" disabled={isInvalid}>
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
