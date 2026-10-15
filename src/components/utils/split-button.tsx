/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Badge, Button, ButtonGroup, CircularProgress, Menu, MenuItem, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StopIcon from '@mui/icons-material/Stop';
import DoneIcon from '@mui/icons-material/Done';
import PlayIcon from '@mui/icons-material/PlayArrow';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { MouseEvent as ReactMouseEvent, useRef, useState } from 'react';
import { AppState } from 'redux/reducer.type';
import { type MuiStyles, RunningStatus } from '@gridsuite/commons-ui';

const styles = {
    badge: (theme) => ({
        '& .MuiBadge-badge': {
            minWidth: theme.spacing(2),
            height: theme.spacing(2),
            padding: 0,
            boxShadow: theme.shadows[2],
        },
    }),
    // a running or already done computation keeps the button look even when it can't be clicked
    notClickable: {
        pointerEvents: 'none',
    },
    menuPaper: {
        marginTop: 0.5,
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

    const isRunning = runningStatus === RunningStatus.RUNNING || runningStatus === RunningStatus.PRELOADING;

    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(event.ctrlKey);
        }
    };

    const handleMenuItemClick = (index: number) => {
        onSelectionChange(index);
        setOpen(false);
    };

    const getResultBadge = (status: RunningStatus) => {
        switch (status) {
            case RunningStatus.SUCCEED:
                return <DoneIcon fontSize="inherit" data-testid="ModelExecutionDone" />;
            case RunningStatus.FAILED:
                return <span data-testid="ModelExecutionFail">!</span>;
            default:
                return null;
        }
    };

    const stopDisabled =
        computationStarting || // disable if fetch starting a computation is pending
        computationStopped; // disable if already stopped once

    return (
        <>
            <ButtonGroup variant="contained" ref={anchorRef}>
                <Badge
                    color={runningStatus === RunningStatus.FAILED ? 'error' : 'success'}
                    badgeContent={getResultBadge(runningStatus)}
                    sx={styles.badge}
                >
                    <Button
                        startIcon={
                            isRunning ? (
                                <CircularProgress color="inherit" size={20} data-testid="ModelExecutionRunning" />
                            ) : (
                                <PlayIcon />
                            )
                        }
                        disabled={buttonDisabled && runningStatus === RunningStatus.IDLE}
                        onClick={buttonDisabled ? undefined : handleClick}
                        sx={buttonDisabled ? styles.notClickable : undefined}
                        data-testid="RunModelButton"
                    >
                        {text}
                    </Button>
                </Badge>
                {isRunning ? (
                    <Tooltip title={<FormattedMessage id="StopComputation" />}>
                        <span style={{ display: 'flex' }}>
                            <Button
                                size="small"
                                onClick={actionOnRunnable}
                                disabled={selectionDisabled || stopDisabled}
                                data-testid="StopComputationButton"
                            >
                                <StopIcon />
                            </Button>
                        </span>
                    </Tooltip>
                ) : (
                    <Button
                        size="small"
                        onClick={() => setOpen(true)}
                        disabled={selectionDisabled}
                        data-testid="RunnableModelsButton"
                    >
                        <ExpandMoreIcon />
                    </Button>
                )}
            </ButtonGroup>
            <Menu
                id="split-button-menu"
                anchorEl={anchorRef.current}
                open={open}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: styles.menuPaper } }}
                marginThreshold={0}
                elevation={1}
            >
                {options.map((option, index) => (
                    <MenuItem
                        disabled={computationStarting}
                        key={option}
                        selected={index === selectedIndex}
                        divider={index === 0}
                        onClick={() => handleMenuItemClick(index)}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default SplitButton;
