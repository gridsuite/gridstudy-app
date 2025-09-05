/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useCallback } from 'react';
import { Checkbox, type CheckboxProps, MenuItem } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export type PartialLoadingMenuItemProps = {
    value: boolean;
    labelId: string;
    onChange: Dispatch<SetStateAction<boolean>>;
};

export default function PartialLoadingMenuItem({ value, labelId, onChange }: Readonly<PartialLoadingMenuItemProps>) {
    const handleChange = useCallback<NonNullable<CheckboxProps['onChange']>>(
        (event) => {
            onChange(event.target.checked);
        },
        [onChange]
    );
    const handleToggle = useCallback(() => {
        onChange((oldValue) => !oldValue);
    }, [onChange]);

    return (
        <MenuItem onClick={handleToggle}>
            <Checkbox
                checked={value}
                onChange={handleChange}
                onClick={(e) => e.stopPropagation()} // avoid double toggle when clicking the checkbox itself
            />
            <FormattedMessage id={labelId} />
        </MenuItem>
    );
}
