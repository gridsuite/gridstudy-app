/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CheckboxItem from './checkbox-item';
import type { RowComponentProps } from 'react-window';
import { ReactElement } from 'react';

// VirtualizedListItem component is customized from renderRow in the MUI example
// https://mui.com/material-ui/react-autocomplete/#virtualization

export type VirtualizedItem = {
    option: string;
    selected: boolean;
    getOptionLabel: (option: string) => string;
    itemProps?: ReactElement;
    children?: VirtualizedItem[];
};

const VirtualizedListItem = ({
    index,
    itemData,
    style,
}: RowComponentProps & {
    itemData: VirtualizedItem[];
}) => {
    const { option, selected, getOptionLabel, itemProps } = itemData[index];

    const { key, ...restItemProps } = itemProps ?? {};
    return (
        <CheckboxItem
            option={option}
            selected={selected}
            getOptionLabel={getOptionLabel}
            style={{
                ...style,
            }}
            key={itemProps?.key}
            {...restItemProps}
        />
    );
};

export default VirtualizedListItem;
