/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CSSProperties, FunctionComponent } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import memoizeOne from 'memoize-one';
import { ReportItem, TreeViewItem } from './TreeViewItem';

const getItemData = memoizeOne(
    (nodes: ReportItem[], onSelectedItem: (node: ReportItem) => void, onExpandItem: (node: ReportItem) => void) => ({
        nodes,
        onSelectedItem,
        onExpandItem,
    })
);

export interface TreeViewProps {
    nodes: ReportItem[];
    onSelectedItem: (node: ReportItem) => void;
    onExpandItem: (node: ReportItem) => void;
    itemSize: number;
    style?: CSSProperties | undefined;
}

export const VirtualizedTreeView: FunctionComponent<TreeViewProps> = (props) => {
    const { onSelectedItem, onExpandItem, nodes } = props;
    const itemData = getItemData(nodes, onSelectedItem, onExpandItem);

    return (
        <AutoSizer>
            {({ height, width }: { height: string | number; width: string | number }) => (
                <FixedSizeList
                    height={height}
                    width={width}
                    style={props.style}
                    itemCount={nodes.length}
                    itemSize={props.itemSize}
                    itemKey={(index) => nodes[index].id}
                    itemData={itemData}
                >
                    {TreeViewItem}
                </FixedSizeList>
            )}
        </AutoSizer>
    );
};
