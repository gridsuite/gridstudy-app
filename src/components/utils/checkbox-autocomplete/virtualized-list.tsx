/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { forwardRef, HTMLAttributes } from 'react';
import VirtualizedListItem, { VirtualizedItem } from './virtualized-list-item';
import { List } from 'react-window';

// component VirtualizedList is customized from ListboxComponent in the MUI example
// https://mui.com/material-ui/react-autocomplete/#virtualization

// Adapter for react-window
const VirtualizedList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLElement>>((props, ref) => {
    const { children, ...otherProps } = props;
    const itemData: VirtualizedItem[] = [];
    for (const item of children as VirtualizedItem[]) {
        itemData.push(item);
        itemData.push(...(item.children ?? []));
    }

    const itemCount = itemData.length;
    const itemSize = 48;

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemCount * itemSize;
    };

    return (
        <div ref={ref} {...otherProps}>
            <List
                rowProps={{ itemData }}
                rowHeight={itemSize}
                style={{ height: getHeight() }}
                overscanCount={5}
                rowCount={itemCount}
                rowComponent={VirtualizedListItem}
            />
        </div>
    );
});

export default VirtualizedList;
