import { Box, IconButton } from '@mui/material';
import { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import GetAppIcon from '@mui/icons-material/GetApp';

export interface ExportButtonProps {
    disabled: boolean;
    onClick: () => void;
}

export const ExportButton: FunctionComponent<ExportButtonProps> = ({
    onClick,
    disabled,
}) => {
    return (
        <>
            <Box>
                <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
            </Box>
            <Box>
                <IconButton
                    disabled={disabled}
                    aria-label="exportCSVButton"
                    onClick={onClick}
                >
                    <GetAppIcon />
                </IconButton>
            </Box>
        </>
    );
};
