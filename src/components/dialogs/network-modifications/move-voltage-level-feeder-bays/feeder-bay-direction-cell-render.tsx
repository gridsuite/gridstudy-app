/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import { Button, Theme } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

type FeeederBayDirectionCellRendererProps = {
    direction: string;
};

const styles = {
    button: (theme: Theme) => ({
        color: theme.palette.primary.main,
        minWidth: '100%',
    }),
};

export default function FeeederBayDirectionCellRenderer({ direction }: Readonly<FeeederBayDirectionCellRendererProps>) {
    let [directionValue, setDirectionValue] = useState<string>(direction);
    const handleButtonClick = useCallback(() => {
        directionValue === 'TOP' ? setDirectionValue('BOTTOM') : setDirectionValue('TOP');
    }, [directionValue, setDirectionValue]);
    return (
        <Button sx={styles.button} onClick={handleButtonClick} size="small" variant="outlined">
            {directionValue}
            {directionValue === 'TOP' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </Button>
    );
}
