/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CSSProperties, FunctionComponent, RefObject } from 'react';
import { FixedSizeList } from 'react-window';
import memoizeOne from 'memoize-one';
import { ReportItem, TreeviewItem } from './treeview-item';
import { AutoSizer } from 'react-virtualized';

const getItemData = memoizeOne(
    (
        nodes: ReportItem[],
        onSelectedItem: (node: ReportItem) => void,
        onExpandItem: (node: ReportItem) => void,
        highlightedReportId?: string
    ) => ({
        nodes,
        onSelectedItem,
        onExpandItem,
        highlightedReportId,
    })
);

export interface TreeViewProps {
    listRef: RefObject<FixedSizeList>;
    nodes: ReportItem[];
    onSelectedItem: (node: ReportItem) => void;
    onExpandItem: (node: ReportItem) => void;
    highlightedReportId?: string;
    itemSize: number;
    style?: CSSProperties;
}

export const VirtualizedTreeview: FunctionComponent<TreeViewProps> = (props) => {
    const { listRef, onSelectedItem, onExpandItem, highlightedReportId, nodes } = props;
    const itemData = getItemData(nodes, onSelectedItem, onExpandItem, highlightedReportId);

    return (
        <AutoSizer>
            {({ height, width }) => (
                <FixedSizeList
                    ref={listRef}
                    height={height}
                    width={width}
                    style={props.style}
                    itemCount={nodes.length}
                    itemSize={props.itemSize}
                    itemKey={(index) => nodes[index].id}
                    itemData={itemData}
                >
                    {TreeviewItem}
                </FixedSizeList>
            )}
        </AutoSizer>
    );
};
