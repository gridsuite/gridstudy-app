/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { FieldLabel } from '@gridsuite/commons-ui';
import { useController } from 'react-hook-form';

interface EnumInputProps<T> {
    options: T[];
    name: string;
    label: string;
    size: 'small' | 'medium';
    labelValues: Record<string, string>;
}

const EnumInput = <T extends { id: string; label: string }>({
    options,
    name,
    label,
    size,
    labelValues,
}: EnumInputProps<T>) => {
    const {
        field: { onChange, value },
        fieldState: { error },
    } = useController({ name });

    return (
        <FormControl fullWidth size={size} error={!!error}>
            <InputLabel id="enum-type-label">
                <FieldLabel label={label} values={labelValues} />
            </InputLabel>
            <Select label={label} id={label} value={value} fullWidth onChange={onChange}>
                {options.map((e) => (
                    <MenuItem value={e.id} key={e.label}>
                        <em>
                            <FormattedMessage id={e.label} />
                        </em>
                    </MenuItem>
                ))}
            </Select>
            {error?.message && (
                <FormHelperText>
                    <FormattedMessage id={error.message} />
                </FormHelperText>
            )}
        </FormControl>
    );
};

export default EnumInput;
