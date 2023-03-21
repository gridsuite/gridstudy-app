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
}));

const SplitButton = (props) => {
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);

    const anchorRef = React.useRef(null);

    const handleClick = () => {
        if (props.onClick) {
            props.onClick();
        }
    };

    const handleMenuItemClick = (event, index) => {
        if (props.isRunning) {
            props.actionOnRunnable();
        } else {
            props.onSelectionChange(index);
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

    const breakText = (text) => {
        return text.split('\n').map((text, i) => (i ? [<br />, text] : text));
    };

    const disabledOption = props.isRunning && props.computationStopped;

    return (
        <>
            <ButtonGroup className={props.className} ref={anchorRef}>
                <Button
                    variant="outlined"
                    startIcon={getRunningIcon(props?.buttonStatus)}
                    className={props.className}
                    disabled={props.buttonDisabled}
                    onClick={handleClick}
                >
                    {breakText(props.text)}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleToggle}
                    className={props.className}
                    disabled={props.selectionDisabled}
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
                                    {props.options.map((option, index) => (
                                        <MenuItem
                                            disabled={disabledOption}
                                            key={option}
                                            selected={
                                                index === props.selectedIndex
                                            }
                                            onClick={(event) =>
                                                handleMenuItemClick(
                                                    event,
                                                    index
                                                )
                                            }
                                        >
                                            {props.isRunning && (
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

SplitButton.defaultProps = {
    fullWidth: false,
    buttonDisabled: false,
    selectionDisabled: false,
    isRunning: false,
};

SplitButton.propTypes = {
    options: PropTypes.array.isRequired,
    fullWidth: PropTypes.bool,
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
