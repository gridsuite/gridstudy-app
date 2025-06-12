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
import { Theme } from '@mui/material';

export const BLINK_LENGTH_MS = 1800;

const styles = {
    header: (theme: Theme) => ({
        padding: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        borderBottom: 'solid 1px',
        borderBottomColor: theme.palette.mode === 'light' ? theme.palette.action.selected : 'transparent',
    }),
    blink: (theme: Theme) => ({
        animation: 'diagramHeaderBlinkAnimation ' + BLINK_LENGTH_MS + 'ms',
        '@keyframes diagramHeaderBlinkAnimation': {
            // This adds a global css rule, so we keep the rule's name specific.
            '0%, 25%': {
                backgroundColor:
                    theme.palette.mode === 'light' ? theme.palette.action.disabled : theme.palette.action.selected,
            },
            '100%': {
                backgroundColor: theme.palette.background.default,
            },
        },
    }),
};

interface CardHeaderProps {
    title?: string;
    onClose?: () => void;
    blinking?: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({ title, onClose, blinking }) => {
    return (
        <Box sx={mergeSx(styles.header, blinking ? styles.blink : undefined)}>
            <OverflowableText className="react-grid-dragHandle" sx={{ flexGrow: '1' }} text={title} />
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default CardHeader;
