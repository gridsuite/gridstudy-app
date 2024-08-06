/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';

import CsvDownloader from 'react-csv-downloader';
import { PHASE_TAP } from '../creation/two-windings-transformer-creation-dialog';
import { MAX_ROWS_NUMBER } from 'components/utils/dnd-table/dnd-table';
import { CancelButton } from '@gridsuite/commons-ui';

export const ImportRuleDialog = (props) => {
    const handleCloseDialog = () => {
        props.setOpenImportRuleDialog(false);
    };

    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: props.ruleType === PHASE_TAP ? 'ImportDephasingRule' : 'ImportRegulationRule',
        header: props.csvColumns,
        resetTrigger: props.openImportRuleDialog,
        maxTapNumber: MAX_ROWS_NUMBER,
    });

    const handleSave = () => {
        if (!selectedFileError) {
            props.handleImportTapRule(selectedFile);
            handleCloseDialog();
        }
    };

    const isInvalid = useMemo(() => {
        return typeof selectedFile === 'undefined' || typeof selectedFileError !== 'undefined';
    }, [selectedFile, selectedFileError]);

    return (
        <Dialog open={props.openImportRuleDialog} fullWidth={true}>
            <DialogTitle>
                <FormattedMessage id={props.ruleType === PHASE_TAP ? 'ImportDephasingRule' : 'ImportRegulationRule'} />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction={'column'}>
                    <Grid item>
                        <CsvDownloader
                            columns={props.csvColumns}
                            datas={[]}
                            filename={props.ruleType === PHASE_TAP ? 'tap-dephasing-rule' : 'tap-regulating-rule'}
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
