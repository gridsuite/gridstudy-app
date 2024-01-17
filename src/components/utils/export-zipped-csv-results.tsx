/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, useCallback, useState } from 'react';
import { downloadZipFile } from '../../services/utils';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, CircularProgress, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useSnackMessage } from '@gridsuite/commons-ui';

interface IExportZippedCsvResults {
    resultDownloadSuccess: boolean;
    setResultDownloadSuccess: React.Dispatch<React.SetStateAction<boolean>>;
    exportPromise: Promise<any>;
    fileName: string;
}

const ExportZippedCsvResults: FunctionComponent<IExportZippedCsvResults> = ({
    resultDownloadSuccess,
    setResultDownloadSuccess,
    exportPromise,
    fileName,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const [csvLoading, setCsvLoading] = useState(false);
    const exportResultsAsCsv = useCallback(() => {
        setCsvLoading(true);
        setResultDownloadSuccess(false);
        exportPromise
            .then((response: any) => {
                response.blob().then((blob: Blob) => {
                    downloadZipFile(blob, fileName);
                    setResultDownloadSuccess(true);
                });
            })
            .catch((error: any) => {
                snackError({
                    messageTxt: error.message,
                    headerId: intl.formatMessage({
                        id: 'csvExportResultError',
                    }),
                });
            })
            .finally(() => setCsvLoading(false));
    }, [intl, snackError, exportPromise, fileName, setResultDownloadSuccess]);

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography>
                <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
            </Typography>
            <Box sx={{ m: 1, position: 'relative' }}>
                <IconButton
                    aria-label="save"
                    color="primary"
                    onClick={exportResultsAsCsv}
                >
                    {resultDownloadSuccess ? <CheckIcon /> : <GetAppIcon />}
                </IconButton>
                {csvLoading && (
                    <CircularProgress
                        size={30}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-15px',
                            marginLeft: '-15px',
                        }}
                    />
                )}
            </Box>
        </div>
    );
};

export default ExportZippedCsvResults;
