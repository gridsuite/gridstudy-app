/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Check as CheckIcon, GetApp as GetAppIcon } from '@mui/icons-material';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';

export interface ExportButtonProps {
    disabled?: boolean;
    onClick: LoadingButtonProps['onClick'];
    isDownloadLoading?: boolean; // used mostly for previous Edge versions where download from backend file takes some time to begin
    isDownloadSuccessful?: boolean;
}

export const ExportButton: FunctionComponent<ExportButtonProps> = ({
    onClick,
    disabled = false,
    isDownloadLoading: isCsvLoading = false,
    isDownloadSuccessful = false,
}) => {
    return (
        <LoadingButton
            variant="text"
            color={isDownloadSuccessful ? 'success' : 'inherit'}
            aria-label="exportCSVButton"
            disabled={disabled}
            startIcon={isDownloadSuccessful ? <CheckIcon /> : <GetAppIcon />}
            loading={isCsvLoading}
            loadingPosition="start"
            onClick={onClick}
        >
            <FormattedMessage id="MuiVirtualizedTable/exportCSV">
                {(txt) => (
                    <Box component="span" data-note="anti-translate-crash">
                        {txt}
                    </Box>
                )}
            </FormattedMessage>
        </LoadingButton>
    );
};
