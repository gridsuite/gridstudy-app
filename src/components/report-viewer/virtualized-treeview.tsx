/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback, useMemo, useRef } from 'react';
import { FixedSizeList } from 'react-window';
import { ReportItem, TreeviewItem } from './treeview-item';
import { AutoSizer } from 'react-virtualized';
import { ReportTree } from '../../utils/report/report.type';
import Label from '@mui/icons-material/Label';
import { Theme } from '@mui/system';
import { useTreeViewScroll } from './use-treeview-scroll';

const styles = {
    treeItem: {
        whiteSpace: 'nowrap',
    },
    labelIcon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

export interface TreeViewProps {
    expandedTreeReports: string[];
    setExpandedTreeReports: (reportIds: string[]) => void;
    selectedReportId: string;
    reportTree: ReportTree;
    onSelectedItem: (node: ReportItem) => void;
    highlightedReportId?: string;
}

export const VirtualizedTreeview: FunctionComponent<TreeViewProps> = ({
    expandedTreeReports,
    setExpandedTreeReports,
    selectedReportId,
    onSelectedItem,
    highlightedReportId,
    reportTree,
}) => {
    const listRef = useRef<FixedSizeList>(null);

    const onExpandItem = useCallback(
        (node: ReportItem) => {
            if (node.collapsed) {
                return setExpandedTreeReports([...expandedTreeReports, node.id]);
            } else {
                return setExpandedTreeReports(expandedTreeReports.filter((id) => id !== node.id));
            }
        },
        [expandedTreeReports, setExpandedTreeReports]
    );

    const toTreeNodes = useCallback(
        (item: ReportTree, depth: number): ReportItem[] => {
            const result: ReportItem[] = [];
            const collapsed = !expandedTreeReports.includes(item.id);
            if (item.id) {
                result.push({
                    collapsed,
                    depth,
                    label: item.message,
                    id: item.id,
                    isLeaf: !item.subReports.find((subReports) => subReports.id !== null),
                    icon: <Label htmlColor={item.severity.colorName} sx={styles.labelIcon} />,
                    isSelected: item.id === selectedReportId,
                });
                if (!collapsed) {
                    for (let subReports of item.subReports) {
                        result.push(...toTreeNodes(subReports, depth + 1));
                    }
                }
            }
            return result;
        },
        [expandedTreeReports, selectedReportId]
    );

    const nodes = useMemo(() => toTreeNodes(reportTree, 0), [reportTree, toTreeNodes]);

    useTreeViewScroll(highlightedReportId, nodes, listRef);

    return (
        <AutoSizer>
            {({ height, width }) => (
                <FixedSizeList
                    ref={listRef}
                    height={height}
                    width={width}
                    style={styles.treeItem}
                    itemCount={nodes.length}
                    itemSize={32}
                    itemKey={(index) => nodes[index].id}
                    itemData={{ nodes, onSelectedItem, onExpandItem, highlightedReportId }}
                >
                    {TreeviewItem}
                </FixedSizeList>
            )}
        </AutoSizer>
    );
};
