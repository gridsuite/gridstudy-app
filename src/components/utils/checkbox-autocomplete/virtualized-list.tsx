/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {forwardRef, HTMLAttributes} from 'react';
import VirtualizedListItem, { LISTBOX_PADDING, VirtualizedItem } from './virtualized-list-item';
import { List } from 'react-window';

// component VirtualizedList is customized from ListboxComponent in the MUI example
// https://mui.com/material-ui/react-autocomplete/#virtualization
//Migration based on https://github.com/mui/material-ui/pull/47054/

// Adapter for react-window
const VirtualizedList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLElement>>((props, ref) => {
    const { children, ...otherProps } = props;
    const itemData: VirtualizedItem[] = [];
    (children as VirtualizedItem[]).forEach((item: VirtualizedItem & { children?: VirtualizedItem[] }) => {
        itemData.push(item);
        itemData.push(...(item.children ?? []));
    });

    const itemCount = itemData.length;
    const itemSize = 48;

    const getHeight = () => {
        if (itemCount > 8) {
            return 7 * itemSize;
        }
        return itemCount * itemSize;
    };

    return (
        <div ref={ref} {...otherProps}>
            <List
                rowProps={{ itemData }}
                rowHeight={itemSize}
                style={{ height: getHeight()}}
                overscanCount={5}
                rowCount={itemCount}
                rowComponent={VirtualizedListItem}
            />
        </div>
    );
});

export default VirtualizedList;
