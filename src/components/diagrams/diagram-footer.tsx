/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
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
};

interface DiagramFooterProps {
    showCounterControls?: boolean;
    showCounterValue?: boolean;
    counterText: string;
    counterValue: number;
    decrementCounterDisabled?: boolean;
    incrementCounterDisabled?: boolean;
    onIncrementCounter?: () => void;
    onDecrementCounter?: () => void;
}

const defaultProps: DiagramFooterProps = {
    showCounterControls: false,
    showCounterValue: true,
    counterText: '',
    counterValue: 0,
    decrementCounterDisabled: true,
    incrementCounterDisabled: false,
};

const DiagramFooter: React.FC<DiagramFooterProps> = ({
    showCounterControls = defaultProps.showCounterControls,
    showCounterValue = defaultProps.showCounterValue,
    counterText = defaultProps.counterText,
    counterValue = defaultProps.counterValue,
    decrementCounterDisabled = defaultProps.decrementCounterDisabled,
    incrementCounterDisabled = defaultProps.incrementCounterDisabled,
    onIncrementCounter,
    onDecrementCounter,
}) => {
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
        </div>
    );
};

export default DiagramFooter;
