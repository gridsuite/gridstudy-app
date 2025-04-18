/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { mergeSx, OverflowableText } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import MinimizeIcon from '@mui/icons-material/Minimize';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { stopDiagramBlink } from '../../redux/actions';
import { Theme } from '@mui/material';
import { AppState } from 'redux/reducer';

const BLINK_LENGTH_MS = 1800;

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
    actionIcon: (theme: Theme) => ({
        padding: 0,
        borderRight: theme.spacing(1),
    }),
    pinRotate: (theme: Theme) => ({
        padding: 0,
        borderRight: theme.spacing(1),
        transform: 'rotate(45deg)',
    }),
    close: (theme: Theme) => ({
        padding: 0,
        borderRight: theme.spacing(1),
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

interface DiagramHeaderProps {
    diagramTitle?: string;
    showMinimizeControl?: boolean;
    onMinimize?: () => void;
    showTogglePinControl?: boolean;
    onTogglePin?: () => void;
    pinned?: boolean;
    showCloseControl?: boolean;
    onClose?: () => void;
    diagramId?: string;
    svgType?: string;
}

const DiagramHeader: React.FC<DiagramHeaderProps> = ({
    diagramTitle,
    showMinimizeControl = false,
    onMinimize,
    showTogglePinControl = false,
    onTogglePin,
    pinned,
    showCloseControl = false,
    onClose,
    diagramId,
    svgType,
}) => {
    const dispatch = useDispatch();

    const handleMinimize = useCallback(() => onMinimize && onMinimize(), [onMinimize]);
    const handleTogglePin = useCallback(() => onTogglePin && onTogglePin(), [onTogglePin]);
    const handleClose = useCallback(() => onClose && onClose(), [onClose]);

    /**
     * BLINKING SYSTEM
     */

    const [blinking, setBlinking] = useState(false);
    const needsToBlink = useSelector(
        (state: AppState) =>
            state.diagramStates.find((diagram) => diagram.svgType === svgType && diagram.id === diagramId)?.needsToBlink
    );

    useEffect(() => {
        if (needsToBlink) {
            dispatch(stopDiagramBlink());
            if (!blinking) {
                setBlinking(true);
                setTimeout(() => {
                    setBlinking(false);
                }, BLINK_LENGTH_MS);
            }
        }
    }, [needsToBlink, dispatch, blinking]);

    /**
     * RENDER
     */

    return (
        <Box sx={mergeSx(styles.header, blinking ? styles.blink : undefined)}>
            <OverflowableText sx={{ flexGrow: '1' }} text={diagramTitle} />
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    {showMinimizeControl && (
                        <IconButton sx={styles.actionIcon} onClick={handleMinimize}>
                            <MinimizeIcon />
                        </IconButton>
                    )}
                    {showTogglePinControl && (
                        <IconButton sx={pinned ? styles.actionIcon : styles.pinRotate} onClick={handleTogglePin}>
                            {pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                        </IconButton>
                    )}
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
