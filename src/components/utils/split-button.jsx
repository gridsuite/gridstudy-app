/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import PropTypes from 'prop-types';
import ListItemIcon from '@mui/material/ListItemIcon';
import StopIcon from '@mui/icons-material/Stop';
import ListItemText from '@mui/material/ListItemText';
import LoopIcon from '@mui/icons-material/Loop';
import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlayIcon from '@mui/icons-material/PlayArrow';
import RunningStatus from './running-status';
import { mergeSx } from './functions';
import { useSelector } from 'react-redux';

const styles = {
    expand: (theme) => ({
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    }),
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    listOptions: (theme) => ({
        minWidth: '270px',
        marginRight: '43px',
        position: 'relative',
        boxShadow: 'none',
        borderRadius: '0',
        border: '1px solid #7f7f7e',
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        '& ul': {
            padding: 0,
            '& li:first-of-type': {
                borderBottom: '1px solid #7f7f7e',
            },
        },
    }),
    stop: {
        color: 'red',
    },
    rotate: {
        animation: 'spin 1000ms infinite',
    },
    succeed: {
        backgroundColor: '#0ca789',
        color: '#fdfdfd',
        border: '1px solid #0ca789',
        '&:nth-of-type(1)': {
            minWidth: '270px',
        },
        '&:nth-of-type(2)': {
            borderLeft: '1px solid #92b1ab',
        },
        '&:disabled, &:hover': {
            backgroundColor: '#0ca789',
            color: '#fdfdfd',
        },
    },
    failed: {
        backgroundColor: '#d85050',
        color: '#fdfdfd',
        border: '1px solid #d85050',
        '&:nth-of-type(1)': {
            minWidth: '270px',
        },
        '&:nth-of-type(2)': {
            borderLeft: '1px solid #c58585',
        },
        '&:disabled, &:hover': {
            backgroundColor: '#d85050',
            color: '#fdfdfd',
        },
    },
    running: (theme) => ({
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        border: '1px solid #808080',
        '&:nth-of-type(1)': {
            minWidth: '270px',
            color: theme.palette.text.primary,
        },
        '&:nth-of-type(2)': {
            borderLeft: '1px solid #4a4a4a',
        },
        '&:hover': {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
        },
    }),
    idle: (theme) => ({
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderColor: '#808080',
        '&:nth-of-type(1)': {
            minWidth: '270px',
            color: theme.palette.text.primary,
        },

        '&:hover': {
            backgroundColor: theme.palette.background.default,
            border: '1px solid ' + theme.palette.primary,
            color: theme.palette.text.primary,
        },
        '&:disabled': {
            color: theme.palette.text.disabled,
        },
    }),
    runMenuButton: {
        zIndex: 99,
    },
};

const SplitButton = ({
    runningStatus,
    buttonDisabled = false,
    selectionDisabled = false,
    computationStopped,
    text,
    options,
    selectedIndex,
    onClick,
    actionOnRunnable,
    onSelectionChange,
}) => {
    const [open, setOpen] = React.useState(false);
    const computationStarting = useSelector((state) => state.computationStarting);

    const anchorRef = React.useRef(null);

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const handleMenuItemClick = (event, index) => {
        if (runningStatus === RunningStatus.RUNNING) {
            actionOnRunnable();
        } else {
            onSelectionChange(index);
        }
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const getRunningIcon = (status) => {
        switch (status) {
            case RunningStatus.RUNNING:
                return <LoopIcon sx={styles.rotate} />;
            case RunningStatus.SUCCEED:
                return <DoneIcon />;
            case RunningStatus.FAILED:
                return <ErrorOutlineIcon />;
            case RunningStatus.IDLE:
            default:
                return <PlayIcon />;
        }
    };

    const getStyle = (runningStatus) => {
        switch (runningStatus) {
            case RunningStatus.SUCCEED:
                return styles.succeed;
            case RunningStatus.FAILED:
                return styles.failed;
            case RunningStatus.RUNNING:
                return styles.running;
            case RunningStatus.IDLE:
            default:
                return styles.idle;
        }
    };

    const breakText = (text) => {
        return text.split('\n').map((text, i) => (i ? [<br />, text] : text));
    };

    const disabledOption =
        computationStarting || // disable if fetch starting a computation is pending
        (runningStatus === RunningStatus.RUNNING && computationStopped); // disable if already stopped once

    return (
        <>
            <ButtonGroup sx={getStyle(runningStatus)} ref={anchorRef}>
                <Button
                    variant="outlined"
                    startIcon={getRunningIcon(runningStatus)}
                    sx={getStyle(runningStatus)}
                    disabled={buttonDisabled}
                    onClick={handleClick}
                >
                    <span style={{ marginTop: '2px' }}>{breakText(text)}</span>
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleToggle}
                    sx={getStyle(runningStatus)}
                    disabled={selectionDisabled}
                >
                    <ArrowDropDownIcon sx={mergeSx(styles.expand, open && styles.expandOpen)} />
                </Button>
            </ButtonGroup>
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition sx={styles.runMenuButton}>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper sx={styles.listOptions}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu">
                                    {options.map((option, index) => (
                                        <MenuItem
                                            disabled={disabledOption}
                                            key={option}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {runningStatus === RunningStatus.RUNNING && (
                                                <ListItemIcon>
                                                    <StopIcon fontSize="small" sx={styles.stop} />
                                                </ListItemIcon>
                                            )}
                                            <ListItemText primary={breakText(option)} />
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
};

SplitButton.propTypes = {
    runningStatus: PropTypes.string,
    options: PropTypes.array.isRequired,
    selectedIndex: PropTypes.number.isRequired,
    onSelectionChange: PropTypes.func,
    onClick: PropTypes.func,
    buttonDisabled: PropTypes.bool,
    selectionDisabled: PropTypes.bool,
    text: PropTypes.string,
    actionOnRunnable: PropTypes.func.isRequired,
    computationStopped: PropTypes.bool,
};

export default SplitButton;
