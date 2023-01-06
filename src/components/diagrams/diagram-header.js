/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MinimizeIcon from '@mui/icons-material/Minimize';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { commonDiagramStyle } from './diagram-common';

const useStyles = makeStyles((theme) => ({
    header: {
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        wordBreak: 'break-all',
        backgroundColor: theme.palette.background.default,
    },
    actionIcon: {
        padding: 0,
        borderRight: theme.spacing(1),
    },
    pinRotate: {
        padding: 0,
        borderRight: theme.spacing(1),
        transform: 'rotate(45deg)',
    },
    close: {
        padding: 0,
        borderRight: theme.spacing(1),
    },
    ...commonDiagramStyle(theme),
}));

const DiagramHeader = (props) => {
    const classes = useStyles();

    const handleMinimize = () => {
        if (props.onMinimize) {
            props.onMinimize();
        }
    };
    const handleTogglePin = () => {
        if (props.onTogglePin) {
            props.onTogglePin();
        }
    };
    const handleClose = () => {
        if (props.onClose) {
            props.onClose();
        }
    };

    return (
        <Box className={classes.header}>
            <Box flexGrow={1}>
                <Typography>{props.diagramTitle}</Typography>
            </Box>
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    {props.showMinimizeControl && (
                        <IconButton
                            className={classes.actionIcon}
                            onClick={handleMinimize}
                        >
                            <MinimizeIcon />
                        </IconButton>
                    )}
                    {props.showTogglePinControl && (
                        <IconButton
                            className={
                                props.pinned
                                    ? classes.actionIcon
                                    : classes.pinRotate
                            }
                            onClick={handleTogglePin}
                        >
                            {props.pinned ? (
                                <PushPinIcon />
                            ) : (
                                <PushPinOutlinedIcon />
                            )}
                        </IconButton>
                    )}
                    {props.showCloseControl && (
                        <IconButton
                            className={classes.close}
                            onClick={handleClose}
                        >
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
};

export default DiagramHeader;
