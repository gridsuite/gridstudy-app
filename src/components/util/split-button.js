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
import PropTypes from "prop-types";

const SplitButton = (props) => {

    const [open, setOpen] = React.useState(false);

    const anchorRef = React.useRef(null);

    const handleClick = () => {
        if (props.onClick) {
            props.onClick();
        }
    };

    const handleMenuItemClick = (event, index) => {
        if (props.onSelectionChange) {
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

    const width = props.fullWidth ? '100%' : 'auto';

    return (
        <div>
            <ButtonGroup style={{...props.style, ...{width: width}}}
                         variant="contained"
                         color="primary"
                         ref={anchorRef}>
                <Button startIcon={props.startIcon}
                        style={{...props.style, ...{width: width}}}
                        disabled={props.buttonDisabled}
                        onClick={handleClick}>
                    {props.text}
                </Button>
                <Button color="primary"
                        size="small"
                        onClick={handleToggle}
                        style={props.style}
                        disabled={props.selectionDisabled}>
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu">
                                    {props.options.map((option, index) => (
                                        <MenuItem
                                            key={option}
                                            selected={index === props.selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {option}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </div>
    );
}

SplitButton.defaultProps = {
    fullWidth: false,
    buttonDisabled: false,
    selectionDisabled: false,
};

SplitButton.propTypes = {
    options: PropTypes.array.isRequired,
    fullWidth: PropTypes.bool,
    selectedIndex: PropTypes.number.isRequired,
    onSelectionChange: PropTypes.func,
    onClick: PropTypes.func,
    buttonDisabled: PropTypes.bool,
    selectionDisabled: PropTypes.bool,
    style: PropTypes.object,
    startIcon: PropTypes.element,
    text: PropTypes.string
};

export default SplitButton;
