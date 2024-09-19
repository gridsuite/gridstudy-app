/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { VariableSizeList } from 'react-window';
import useResetCache from './use-reset-cache';
import VirtualizedListItem, { LISTBOX_PADDING } from './virtualized-list-item';
import { createContext, forwardRef, HTMLAttributes, ReactElement, useContext } from 'react';

// component VirtualizedList is customized from ListboxComponent in the MUI example
// https://mui.com/material-ui/react-autocomplete/#virtualization

const OuterElementContext = createContext({});

const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
});

// Adapter for react-window
const VirtualizedList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLElement>>((props, ref) => {
    const { children, ...otherProps } = props;
    const itemData: ReactElement[] = [];
    (children as ReactElement[]).forEach((item: ReactElement & { children?: ReactElement[] }) => {
        itemData.push(item);
        itemData.push(...(item.children ?? []));
    });

    const itemCount = itemData.length;
    const itemSize = 48;

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemCount * itemSize;
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={otherProps}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * LISTBOX_PADDING}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={(_index) => itemSize}
                    overscanCount={5}
                    itemCount={itemCount}
                    children={VirtualizedListItem}
                />
            </OuterElementContext.Provider>
        </div>
    );
});

export default VirtualizedList;
