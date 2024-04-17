/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { Checkbox, Typography } from '@mui/material';
import { OverflowableText } from '@gridsuite/commons-ui';

export const LISTBOX_PADDING = 8; // px

const styles = {
    checkbox: {
        marginRight: LISTBOX_PADDING,
    },
};

export const customItemStyle = (originalStyle: React.CSSProperties) => ({
    ...originalStyle,
    top: isNaN(originalStyle.top as number)
        ? 0
        : (originalStyle.top as number) + LISTBOX_PADDING,
});

interface CheckboxItemProps<Value> extends React.HTMLAttributes<HTMLElement> {
    option: Value;
    selected: boolean;
    getOptionLabel: (option: Value) => string;
}

const CheckboxItem = <Value,>({
    option,
    selected,
    getOptionLabel,
    style,
    ...otherProps
}: CheckboxItemProps<Value>) => {
    return (
        <Typography
            component="li"
            {...otherProps}
            noWrap
            style={customItemStyle(style ?? {})}
        >
            <Checkbox style={styles.checkbox} checked={selected} />
            <OverflowableText text={getOptionLabel(option)} />
        </Typography>
    );
};

export default CheckboxItem;
