/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { OverflowableText } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import MinimizeIcon from '@mui/icons-material/Minimize';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import { stopDiagramBlink } from '../../redux/actions';
import { mergeSx } from '../utils/functions';

const BLINK_LENGTH_MS = 1800;

const styles = {
    header: (theme) => ({
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
    actionIcon: (theme) => ({
        padding: 0,
        borderRight: theme.spacing(1),
    }),
    pinRotate: (theme) => ({
        padding: 0,
        borderRight: theme.spacing(1),
        transform: 'rotate(45deg)',
    }),
    close: (theme) => ({
        padding: 0,
        borderRight: theme.spacing(1),
    }),
    blink: (theme) => ({
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

const DiagramHeader = (props) => {
    const dispatch = useDispatch();

    const { onMinimize, onTogglePin, onClose } = props;
    const handleMinimize = useCallback(() => onMinimize && onMinimize(), [onMinimize]);
    const handleTogglePin = useCallback(() => onTogglePin && onTogglePin(), [onTogglePin]);
    const handleClose = useCallback(() => onClose && onClose(), [onClose]);

    /**
     * BLINKING SYSTEM
     */

    const [blinking, setBlinking] = useState(false);
    const needsToBlink = useSelector(
        (state) =>
            state.diagramStates.find((diagram) => diagram.svgType === props?.svgType && diagram.id === props?.diagramId)
                ?.needsToBlink
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
        <Box sx={mergeSx(styles.header, blinking && styles.blink)}>
            <OverflowableText sx={{ flexGrow: '1' }} text={props.diagramTitle} />
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    {props.showMinimizeControl && (
                        <IconButton sx={styles.actionIcon} onClick={handleMinimize}>
                            <MinimizeIcon />
                        </IconButton>
                    )}
                    {props.showTogglePinControl && (
                        <IconButton sx={props.pinned ? styles.actionIcon : styles.pinRotate} onClick={handleTogglePin}>
                            {props.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                        </IconButton>
                    )}
                    {props.showCloseControl && (
                        <IconButton sx={styles.close} onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

DiagramHeader.defaultProps = {
    showMinimizeControl: false,
    showTogglePinControl: false,
    showCloseControl: false,
};

DiagramHeader.propTypes = {
    diagramTitle: PropTypes.string,
    showMinimizeControl: PropTypes.bool,
    onMinimize: PropTypes.func,
    showTogglePinControl: PropTypes.bool,
    onTogglePin: PropTypes.func,
    pinned: PropTypes.bool,
    showCloseControl: PropTypes.bool,
    onClose: PropTypes.func,
    diagramId: PropTypes.string,
    svgType: PropTypes.string.isRequired,
};

export default DiagramHeader;
