/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TextField, Tooltip } from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';

export const TableNumericalInput = ({
    name,
    min,
    max,
    style,
    inputProps,
    ...props
}) => {
    const { trigger } = useFormContext();
    const {
        field: { onChange, value, ref },
        fieldState: { error },
    } = useController({ name });

    const intl = useIntl();

    const inputTransform = (value) => {
        if (['-', '.'].includes(value)) return value;
        return value === null || isNaN(value) ? '' : value.toString();
    };

    const outputTransform = (value) => {
        if (value === '-') return value;
        if (value === '') return null;

        const tmp = value?.replace(',', '.') || '';
        if (tmp.endsWith('.') || tmp.endsWith('0')) return value;
        return parseFloat(tmp) || null;
    };

    const handleInputChange = (e) => {
        onChange(outputTransform(e.target.value));
        trigger(name);
    };

    const transformedValue = inputTransform(value);

    const renderNumericText = (
        <TextField
            value={transformedValue}
            onChange={handleInputChange}
            {...props}
            error={!!error?.message}
            type="Number"
            size={'small'}
            margin={'none'}
            style={{ ...style, padding: 0 }}
            inputRef={ref}
            inputProps={{
                style: {
                    textAlign: 'center',
                    fontSize: 'small',
                },
                min: { min },
                max: { max },
                step: 'any',
                lang: 'en-US', // to have . as decimal separator
                ...inputProps,
            }}
        />
    );

    const renderNumericTextWithTooltip = () => {
        let tooltip = '';
        if (min !== undefined && max !== undefined) {
            tooltip = intl.formatMessage({ id: 'MinMax' }, { min, max });
        } else if (min !== undefined) {
            tooltip = intl.formatMessage({ id: 'OnlyMin' }, { min });
        } else if (max !== undefined) {
            tooltip = intl.formatMessage({ id: 'OnlyMax' }, { max });
        }
        if (tooltip !== '') {
            return <Tooltip title={tooltip}>{renderNumericText()}</Tooltip>;
        }
        return renderNumericText;
    };

    return <div>{renderNumericTextWithTooltip()}</div>;
};
