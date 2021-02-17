/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import StopIcon from '@material-ui/icons/Stop';
import ListItemText from '@material-ui/core/ListItemText';

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
}));

const SplitButton = (props) => {
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);

    const anchorRef = React.useRef(null);

    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleClick = () => {
        if (props.onClick) {
            props.onClick();
        }
    };

    const handleMenuItemClick = (event, index) => {
        if (!props.isRunning) {
            props.onSelectionChange(index);
        } else {
            props.onStopComputation();
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

    const breakText = (text) => {
        return text.split('\n').map((text, i) => (i ? [<br />, text] : text));
    };

    const disabledOption = props.isRunning && props.computationStopped;

    return (
        <>
            <ButtonGroup
                className={props.className}
                variant="outlined"
                color="primary"
                ref={anchorRef}
            >
                <Button
                    variant="outlined"
                    startIcon={props.startIcon}
                    className={props.className}
                    disabled={props.buttonDisabled}
                    onClick={handleClick}
                >
                    {breakText(props.text)}
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={handleToggle}
                    className={props.className}
                    disabled={props.selectionDisabled}
                >
                    <ArrowDropDownIcon
                        onClick={handleExpandClick}
                        className={clsx(classes.expand, {
                            [classes.expandOpen]: expanded,
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
    onStopComputation: PropTypes.func,
    isRunning: PropTypes.bool,
    computationStopped: PropTypes.bool,
};

export default SplitButton;
