/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { Theme, Typography, IconButton } from '@mui/material';

const styles = {
    counterText: (theme: Theme) => ({
        bottom: theme.spacing(4),
        left: theme.spacing(1),
        position: 'absolute',
    }),
    incrementCounterIcon: (theme: Theme) => ({
        padding: 0,
        bottom: theme.spacing(1),
        left: theme.spacing(5.5),
        position: 'absolute',
        cursor: 'pointer',
    }),
    decrementCounterIcon: (theme: Theme) => ({
        padding: 0,
        bottom: theme.spacing(1),
        left: theme.spacing(2),
        position: 'absolute',
        cursor: 'pointer',
    }),
    fullScreenIcon: (theme: Theme) => ({
        bottom: theme.spacing(1),
        right: theme.spacing(2),
        position: 'absolute',
        cursor: 'pointer',
    }),
};

interface DiagramFooterProps {
    showCounterControls?: boolean;
    showCounterValue?: boolean;
    showFullscreenControl?: boolean;
    counterText: string;
    counterValue: number;
    fullScreenActive?: boolean;
    decrementCounterDisabled?: boolean;
    incrementCounterDisabled?: boolean;
    onIncrementCounter?: () => void;
    onDecrementCounter?: () => void;
    onStopFullScreen?: () => void;
    onStartFullScreen?: () => void;
}

const defaultProps: DiagramFooterProps = {
    showCounterControls: false,
    showCounterValue: true,
    showFullscreenControl: false,
    counterText: '',
    counterValue: 0,
    fullScreenActive: false,
    decrementCounterDisabled: true,
    incrementCounterDisabled: false,
};

const DiagramFooter: React.FC<DiagramFooterProps> = ({
    showCounterControls = defaultProps.showCounterControls,
    showCounterValue = defaultProps.showCounterValue,
    showFullscreenControl = defaultProps.showFullscreenControl,
    counterText = defaultProps.counterText,
    counterValue = defaultProps.counterValue,
    fullScreenActive = defaultProps.fullScreenActive,
    decrementCounterDisabled = defaultProps.decrementCounterDisabled,
    incrementCounterDisabled = defaultProps.incrementCounterDisabled,
    onIncrementCounter,
    onDecrementCounter,
    onStopFullScreen,
    onStartFullScreen,
}) => {
    const handleStopFullScreen = useCallback(() => onStopFullScreen && onStopFullScreen(), [onStopFullScreen]);
    const handleStartFullScreen = useCallback(() => onStartFullScreen && onStartFullScreen(), [onStartFullScreen]);
    const handleIncrementCounter = useCallback(() => onIncrementCounter && onIncrementCounter(), [onIncrementCounter]);
    const handleDecrementCounter = useCallback(() => onDecrementCounter && onDecrementCounter(), [onDecrementCounter]);

    return (
        <div style={{ display: 'flex' }}>
            {showCounterControls && (
                <>
                    {showCounterValue && <Typography sx={styles.counterText}>{counterText + counterValue}</Typography>}
                    <IconButton
                        onClick={handleIncrementCounter}
                        disabled={incrementCounterDisabled}
                        sx={styles.incrementCounterIcon}
                    >
                        <AddCircleIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleDecrementCounter}
                        disabled={decrementCounterDisabled}
                        sx={styles.decrementCounterIcon}
                    >
                        <RemoveCircleIcon />
                    </IconButton>
                </>
            )}
            {showFullscreenControl && (
                <>
                    {fullScreenActive && (
                        <FullscreenExitIcon onClick={handleStopFullScreen} sx={styles.fullScreenIcon} />
                    )}
                    {!fullScreenActive && <FullscreenIcon onClick={handleStartFullScreen} sx={styles.fullScreenIcon} />}
                </>
            )}
        </div>
    );
};

export default DiagramFooter;
