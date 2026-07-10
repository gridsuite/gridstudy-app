/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { TextField, Tooltip, TextFieldProps } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import { TOOLTIP_DELAY } from '../../../utils/UIconstants';

export const styles = {
    tooltip: {
        fontSize: 18,
        maxWidth: 'none',
    },
};

interface UseButtonWithTooltipProps {
    handleClick: React.MouseEventHandler<HTMLButtonElement>;
    label: string;
    icon: ReactNode;
}

export const useButtonWithTooltip = ({ handleClick, label, icon }: UseButtonWithTooltipProps) => {
    return useMemo(() => {
        return (
            <Tooltip
                title={<FormattedMessage id={label} />}
                placement="top"
                arrow
                enterDelay={TOOLTIP_DELAY}
                enterNextDelay={TOOLTIP_DELAY}
                slotProps={{
                    popper: {
                        sx: {
                            '& .MuiTooltip-tooltip': styles.tooltip,
                        },
                    },
                }}
            >
                <IconButton style={{ padding: '2px' }} onClick={handleClick}>
                    {icon}
                </IconButton>
            </Tooltip>
        );
    }, [label, handleClick, icon]);
};

interface UseSimpleTextValueProps {
    defaultValue: string;
    adornment: TextFieldProps['InputProps'];
    error: boolean;
    triggerReset: boolean;
}

export const useSimpleTextValue = ({ defaultValue, adornment, error, triggerReset }: UseSimpleTextValueProps) => {
    const [value, setValue] = useState(defaultValue);

    const handleChangeValue = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(event.target.value);
    }, []);

    const field = useMemo(() => {
        return (
            <TextField
                value={value}
                onChange={handleChangeValue}
                {...(adornment && { InputProps: adornment })}
                error={error !== undefined}
                autoFocus={true}
                fullWidth={true}
            />
        );
    }, [value, handleChangeValue, adornment, error]);

    useEffect(() => setValue(defaultValue), [defaultValue, triggerReset]);

    return [value, field] as const;
};
