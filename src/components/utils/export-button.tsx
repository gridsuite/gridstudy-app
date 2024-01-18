import { Box, CircularProgress, IconButton } from '@mui/material';
import { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import GetAppIcon from '@mui/icons-material/GetApp';
import CheckIcon from '@mui/icons-material/Check';

export interface ExportButtonProps {
    disabled?: boolean;
    onClick: () => void;
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
            <Box sx={{ position: 'relative' }}>
                <IconButton
                    disabled={disabled}
                    aria-label="exportCSVButton"
                    onClick={onClick}
                >
                    {isDownloadSuccessful ? <CheckIcon /> : <GetAppIcon />}
                </IconButton>
                {isCsvLoading && (
                    <CircularProgress
                        size={30}
                        // style from MUI documentation to wrap icon with circular progress
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
        </Box>
    );
};
