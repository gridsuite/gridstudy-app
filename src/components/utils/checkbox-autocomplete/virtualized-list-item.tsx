/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ListChildComponentProps } from 'react-window';
import CheckboxItem from './checkbox-item';

// VirtualizedListItem component is customized from renderRow in the MUI example
// https://mui.com/material-ui/react-autocomplete/#virtualization

export const LISTBOX_PADDING = 8; // px

const VirtualizedListItem = ({ data, index, style }: ListChildComponentProps) => {
    const [option, selected, getOptionLabel, itemProps] = data[index];
    return (
        <CheckboxItem
            option={option}
            selected={selected}
            getOptionLabel={getOptionLabel}
            style={{
                ...style,
                top: Number(style.top) + LISTBOX_PADDING,
            }}
            {...itemProps}
        />
    );
};

export default VirtualizedListItem;
