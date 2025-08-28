/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { Checkbox, type CheckboxProps, MenuItem } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import type { SpreadsheetPartialData } from '../../types/SpreadsheetPartialData';
import { useSelector } from 'react-redux';
import type { AppState } from '../../../../redux/reducer';

export type PartialLoadingMenuItemProps<K extends keyof SpreadsheetPartialData> = {
    key: K;
    option: keyof SpreadsheetPartialData[K];
    labelId: string;
    onChange: (newValue: boolean) => void;
};

export default function PartialLoadingMenuItem<K extends keyof SpreadsheetPartialData>({
    key,
    option,
    labelId,
    onChange,
}: Readonly<PartialLoadingMenuItemProps<K>>) {
    const lazyOptions = useSelector((state: AppState) => state.spreadsheetPartialData);
    const currentValue = lazyOptions[key][option] as boolean;
    const [newValue, setNewValue] = useState(currentValue);
    const handleChange = useCallback<NonNullable<CheckboxProps['onChange']>>(
        (_, value) => {
            setNewValue(value);
            onChange(value);
        },
        [onChange]
    );

    return (
        <MenuItem>
            <Checkbox
                defaultChecked={currentValue}
                onChange={handleChange}
                color={currentValue === newValue ? 'primary' : 'secondary'}
            />
            <FormattedMessage id={labelId} />
        </MenuItem>
    );
}
