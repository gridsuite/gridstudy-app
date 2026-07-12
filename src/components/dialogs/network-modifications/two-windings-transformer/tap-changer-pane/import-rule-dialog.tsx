/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2 as Grid, Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { CancelButton, CsvPicker, getCsvDelimiter, MAX_ROWS_NUMBER } from '@gridsuite/commons-ui';
import { useCSVDownloader } from 'react-papaparse';
import type Papa from 'papaparse';
import { useSelector } from 'react-redux';
import { PHASE_TAP, RuleType } from '../two-windings-transformer.types';
import { AppState } from 'redux/reducer.type';
import { transformIfFrenchNumber } from '../../tabular/tabular-common';

// Tap-changer rule imports treat every column as optional: no column is required.
const NO_REQUIRED_COLUMNS: string[] = [];

export interface ImportRuleDialogProps {
    ruleType: RuleType;
    openImportRuleDialog: boolean;
    setOpenImportRuleDialog: (open: boolean) => void;
    csvColumns: string[];
    handleImportTapRule: (results: Papa.ParseResult<Record<string, string>>) => void;
}

export const ImportRuleDialog = ({
    ruleType,
    openImportRuleDialog,
    setOpenImportRuleDialog,
    csvColumns,
    handleImportTapRule,
}: ImportRuleDialogProps) => {
    const language = useSelector((state: AppState) => state.computedLanguage);
    const { CSVDownloader } = useCSVDownloader();

    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [fileErrorMessage, setFileErrorMessage] = useState<string | undefined>();
    const [parsedResults, setParsedResults] = useState<Papa.ParseResult<Record<string, string>> | undefined>();

    useEffect(() => {
        setSelectedFile(undefined);
        setFileErrorMessage(undefined);
        setParsedResults(undefined);
    }, [openImportRuleDialog]);

    const parseConfig = useMemo<Partial<Papa.ParseConfig<Record<string, string>>>>(
        () => ({ transform: (value: string) => transformIfFrenchNumber(value, language) }),
        [language]
    );

    const handleCloseDialog = () => {
        setOpenImportRuleDialog(false);
    };

    const handleSave = () => {
        if (!fileErrorMessage && parsedResults) {
            handleImportTapRule(parsedResults);
            handleCloseDialog();
        }
    };

    const isInvalid = useMemo(() => {
        return typeof parsedResults === 'undefined' || typeof fileErrorMessage !== 'undefined';
    }, [parsedResults, fileErrorMessage]);

    return (
        <Dialog open={openImportRuleDialog} fullWidth={true}>
            <DialogTitle>
                <FormattedMessage id={ruleType === PHASE_TAP ? 'ImportDephasingRule' : 'ImportRegulationRule'} />
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <Grid>
                        <CSVDownloader
                            data={[csvColumns]}
                            filename={ruleType === PHASE_TAP ? 'tap-dephasing-rule' : 'tap-regulating-rule'}
                            config={{ delimiter: getCsvDelimiter(language) }}
                        >
                            <Button variant="contained">
                                <FormattedMessage id="GenerateSkeleton" />
                            </Button>
                        </CSVDownloader>
                    </Grid>
                    <Grid>
                        <CsvPicker<Record<string, string>>
                            label={ruleType === PHASE_TAP ? 'ImportDephasingRule' : 'ImportRegulationRule'}
                            requiredColumns={NO_REQUIRED_COLUMNS}
                            maxLineNumber={MAX_ROWS_NUMBER}
                            language={language}
                            parseConfig={parseConfig}
                            selectedFile={selectedFile}
                            onFileChange={setSelectedFile}
                            onFileError={setFileErrorMessage}
                            onComplete={setParsedResults}
                        />
                    </Grid>
                    {fileErrorMessage && (
                        <Grid>
                            <Alert severity="error">{fileErrorMessage}</Alert>
                        </Grid>
                    )}
                </Stack>
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
