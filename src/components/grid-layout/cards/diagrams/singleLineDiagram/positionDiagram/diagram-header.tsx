/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import Box from '@mui/material/Box';
import { OverflowableText } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Theme } from '@mui/material';

const styles = {
    header: (theme: Theme) => ({
        // prevent header from making the window wider, prevent bugs when displaying a lot of different voltage levels
        position: 'absolute',
        width: '100%',
        ////
        padding: '5px',
        display: 'flex',
        flexDirection: 'row',
        wordBreak: 'break-all',
        backgroundColor: theme.palette.background.default,
        borderBottom: 'solid 1px',
        borderBottomColor: theme.palette.mode === 'light' ? theme.palette.action.selected : 'transparent',
    }),
    close: (theme: Theme) => ({
        padding: 0,
        borderRight: theme.spacing(1),
    }),
};

interface DiagramHeaderProps {
    diagramTitle?: string;
    showCloseControl?: boolean;
    onClose?: () => void;
}

const DiagramHeader: React.FC<DiagramHeaderProps> = ({ diagramTitle, showCloseControl = false, onClose }) => {
    const handleClose = useCallback(() => onClose && onClose(), [onClose]);

    return (
        <Box sx={styles.header}>
            <OverflowableText sx={{ flexGrow: '1' }} text={diagramTitle} />
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    {showCloseControl && (
                        <IconButton sx={styles.close} onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default DiagramHeader;
