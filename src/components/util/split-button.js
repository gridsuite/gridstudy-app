/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback } from 'react';
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
import clsx from 'clsx';
import makeStyles from '@mui/styles/makeStyles';
import ListItemIcon from '@mui/material/ListItemIcon';
import StopIcon from '@mui/icons-material/Stop';
import ListItemText from '@mui/material/ListItemText';
import LoopIcon from '@mui/icons-material/Loop';
import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlayIcon from '@mui/icons-material/PlayArrow';
import { RunningStatus } from './running-status';

const useStyles = makeStyles((theme) => ({
    expand: {
        transform: 'rotate(180deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(0deg)',
    },
    listOptions: {
        minWidth: 275,
        left: '-21px',
        top: '1px',
        position: 'relative',
        boxShadow: 'none',
        borderRadius: '0',
        border: '1px solid #7f7f7e',
        background: '#242424',
        color: '#fdfdfd',
        '& ul': {
            padding: 0,
            '& li:first-child': {
                borderBottom: '1px solid #7f7f7e',
            },
        },
    },
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
        '&:nth-child(1)': {
            minWidth: 270,
        },
        '&:nth-child(2)': {
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
        '&:nth-child(1)': {
            minWidth: 270,
        },
        '&:nth-child(2)': {
            borderLeft: '1px solid #c58585',
        },
        '&:disabled, &:hover': {
            backgroundColor: '#d85050',
            color: '#fdfdfd',
        },
    },
    running: {
        backgroundColor: '#242424',
        color: '#fdfdfd',
        border: '1px solid #808080',
        '&:nth-child(1)': {
            minWidth: 270,
            color: '#fdfdfd',
        },
        '&:nth-child(2)': {
            borderLeft: '1px solid #4a4a4a',
        },
        '&:hover': {
            backgroundColor: '#242424',
            color: '#fdfdfd',
        },
    },
    idle: {
        backgroundColor: '#242424',
        color: '#fdfdfd',
        border: '1px solid #808080',
        '&:nth-child(1)': {
            minWidth: 270,
            color: '#fdfdfd',
        },
        '&:nth-child(2)': {
            borderLeft: '1px solid #4a4a4a',
        },
        '&:hover': {
            backgroundColor: '#242424',
            border: '1px solid ' + theme.palette.primary,
            color: '#fdfdfd',
        },
        '&:disabled': {
            color: '#717171',
        },
    },
}));
const SplitButton = ({
    runningStatus,
    buttonDisabled = false,
    selectionDisabled = false,
    computationStopped,
    isRunning = false,
    text,
    options,
    selectedIndex,
    onClick,
    actionOnRunnable,
    onSelectionChange,
}) => {
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);

    const anchorRef = React.useRef(null);

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const handleMenuItemClick = (event, index) => {
        if (isRunning) {
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
                return <LoopIcon className={classes.rotate} />;
            case RunningStatus.SUCCEED:
                return <DoneIcon />;
            case RunningStatus.FAILED:
                return <ErrorOutlineIcon />;
            case RunningStatus.IDLE:
            default:
                return <PlayIcon />;
        }
    };

    const getStyle = useCallback(
        (runningStatus) => {
            switch (runningStatus) {
                case RunningStatus.SUCCEED:
                    return classes.succeed;
                case RunningStatus.FAILED:
                    return classes.failed;
                case RunningStatus.RUNNING:
                    return classes.running;
                case RunningStatus.IDLE:
                default:
                    return classes.idle;
            }
        },
        [classes.failed, classes.idle, classes.running, classes.succeed]
    );

    const breakText = (text) => {
        return text.split('\n').map((text, i) => (i ? [<br />, text] : text));
    };

    const disabledOption = isRunning && computationStopped;

    return (
        <>
            <ButtonGroup className={getStyle(runningStatus)} ref={anchorRef}>
                <Button
                    variant="outlined"
                    startIcon={getRunningIcon(runningStatus)}
                    className={getStyle(runningStatus)}
                    disabled={buttonDisabled}
                    onClick={handleClick}
                >
                    {breakText(text)}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleToggle}
                    className={getStyle(runningStatus)}
                    disabled={selectionDisabled}
                >
                    <ArrowDropDownIcon
                        className={clsx(classes.expand, {
                            [classes.expandOpen]: open,
                        })}
                    />
                </Button>
            </ButtonGroup>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom'
                                    ? 'center top'
                                    : 'center bottom',
                        }}
                    >
                        <Paper className={classes.listOptions}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu">
                                    {options.map((option, index) => (
                                        <MenuItem
                                            disabled={disabledOption}
                                            key={option}
                                            selected={index === selectedIndex}
                                            onClick={(event) =>
                                                handleMenuItemClick(
                                                    event,
                                                    index
                                                )
                                            }
                                        >
                                            {isRunning && (
                                                <ListItemIcon>
                                                    <StopIcon
                                                        fontSize="small"
                                                        className={classes.stop}
                                                    />
                                                </ListItemIcon>
                                            )}
                                            <ListItemText
                                                primary={breakText(option)}
                                            />
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
    className: PropTypes.string,
    startIcon: PropTypes.element,
    text: PropTypes.string,
    actionOnRunnable: PropTypes.func.isRequired,
    isRunning: PropTypes.bool,
    computationStopped: PropTypes.bool,
};

export default SplitButton;
