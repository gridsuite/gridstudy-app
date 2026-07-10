/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Button,
    ButtonGroup,
    ClickAwayListener,
    Grow,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Paper,
    Popper,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import StopIcon from '@mui/icons-material/Stop';
import LoopIcon from '@mui/icons-material/Loop';
import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlayIcon from '@mui/icons-material/PlayArrow';
import RunningStatus from './running-status';
import { useSelector } from 'react-redux';
import { MouseEvent as ReactMouseEvent, useRef, useState } from 'react';
import { AppState } from 'redux/reducer.type';
import { mergeSx, type MuiStyles } from '@gridsuite/commons-ui';

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
} as const satisfies MuiStyles;

interface SplitButtonProps {
    runningStatus: RunningStatus;
    buttonDisabled?: boolean;
    selectionDisabled?: boolean;
    computationStopped: boolean;
    text: string;
    options: string[];
    selectedIndex: number;
    onClick: (debug?: boolean) => void;
    actionOnRunnable: () => void;
    onSelectionChange: (index: number) => void;
}

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
}: SplitButtonProps) => {
    const [open, setOpen] = useState(false);
    const computationStarting = useSelector((state: AppState) => state.computationStarting);

    const anchorRef = useRef<HTMLDivElement | null>(null);

    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(event.ctrlKey);
        }
    };

    const handleMenuItemClick = (event: ReactMouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
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

    const handleClose = (event: MouseEvent | TouchEvent) => {
        // after doing some researches, casting event.target as HTMLElement seems to be the way to type this
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }
        setOpen(false);
    };

    const getRunningIcon = (status: RunningStatus) => {
        switch (status) {
            case RunningStatus.RUNNING:
                return <LoopIcon sx={styles.rotate} data-testid="ModelExecutionRunning" />;
            case RunningStatus.SUCCEED:
                return <DoneIcon data-testid="ModelExecutionDone" />;
            case RunningStatus.FAILED:
                return <ErrorOutlineIcon data-testid="ModelExecutionFail" />;
            case RunningStatus.IDLE:
            default:
                return <PlayIcon />;
        }
    };

    const getStyle = (runningStatus: RunningStatus) => {
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

    const breakText = (text: string) => {
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
                    data-testid="RunModelButton"
                >
                    <span style={{ marginTop: '2px' }}>{breakText(text)}</span>
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleToggle}
                    sx={getStyle(runningStatus)}
                    disabled={selectionDisabled}
                    data-testid="RunnableModelsButton"
                >
                    <ArrowDropDownIcon sx={mergeSx(styles.expand, open ? styles.expandOpen : undefined)} />
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

export default SplitButton;
