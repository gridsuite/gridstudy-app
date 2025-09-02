/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import { IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { TextInput } from '@gridsuite/commons-ui';
import { useController } from 'react-hook-form';
import { useIntl } from "react-intl";

type FeeederBayDirectionCellRendererProps = {
    name: string;
};

export default function FeederBayDirectionCellRenderer({ name }: Readonly<FeeederBayDirectionCellRendererProps>) {
    const {
        field: { value, onChange },
    } = useController({ name });
    const intl = useIntl();

    const handleClick = useCallback(() => {
        if (value !== null) {
          const newValue = intl.formatMessage({ id: value === 'TOP' ? 'TOP' : 'BOTTOM' });
          onChange(newValue);
        }
    }, [value, onChange, intl]);

    const addIconAdornment = useCallback(
        (clickCallback: () => void) => {
            return (
                <IconButton onClick={clickCallback} sx={{ position: 'start' }}>
                    {value === 'TOP' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                </IconButton>
            );
        },
        [value]
    );

    return <TextInput name={name} customAdornment={addIconAdornment(handleClick)} />;
}
