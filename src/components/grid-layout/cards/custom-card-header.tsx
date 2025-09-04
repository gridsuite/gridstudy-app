/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { mergeSx, OverflowableText } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Theme, Typography } from '@mui/material';

export const BLINK_LENGTH_MS = 1800;

const styles = {
    header: (theme: Theme) => ({
        paddingLeft: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.mode === 'light' ? 'white' : '#292e33',
        border:
            theme.palette.mode === 'light'
                ? `1px solid ${theme.palette.grey[500]}`
                : `1px solid ${theme.palette.grey[800]}`,
        borderRadius: theme.spacing(2) + ' ' + theme.spacing(2) + ' 0 0',
        cursor: 'grab',
    }),
    blink: (theme: Theme) => ({
        animation: 'diagramHeaderBlinkAnimation ' + BLINK_LENGTH_MS + 'ms',
        '@keyframes diagramHeaderBlinkAnimation': {
            // This adds a global css rule, so we keep the rule's name specific.
            '0%, 25%': {
                backgroundColor: theme.palette.mode === 'light' ? '#292e33' : 'white',
            },
            '100%': {
                backgroundColor: theme.palette.mode === 'light' ? 'white' : '#292e33',
            },
        },
    }),
};

interface CustomCardHeaderProps {
    title?: React.ReactNode;
    onClose?: () => void;
    blinking?: boolean;
}

const CustomCardHeader: React.FC<CustomCardHeaderProps> = ({ title, onClose, blinking }) => {
    return (
        <Box sx={mergeSx(styles.header, blinking ? styles.blink : undefined)}>
            <OverflowableText
                className="react-grid-dragHandle"
                sx={{ flexGrow: '1', paddingBottom: '2px' }}
                text={<Typography variant="caption">{title}</Typography>}
            />
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <IconButton className="card-header-close-button" size="small" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default CustomCardHeader;
