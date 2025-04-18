/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { FixedSizeList } from 'react-window';
import { ReportItem, TreeviewItem } from './treeview-item';
import { ReportTree } from '../../utils/report/report.type';
import Label from '@mui/icons-material/Label';
import { useTreeViewScroll } from './use-treeview-scroll';
import { QuickSearch } from './QuickSearch';
import { Box, Theme } from '@mui/material';
import AutoSizer from 'react-virtualized-auto-sizer';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    treeItem: {
        whiteSpace: 'nowrap',
    },
    labelIcon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
    quickSearch: { minWidth: '100%', flexShrink: 0, marginBottom: 1 },
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
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);

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
        (item: ReportTree, depth: number, expandedTreeReports: string[]): ReportItem[] => {
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
                        result.push(...toTreeNodes(subReports, depth + 1, expandedTreeReports));
                    }
                }
            }
            return result;
        },
        [selectedReportId]
    );

    const nodes = useMemo(
        () => toTreeNodes(reportTree, 0, expandedTreeReports),
        [reportTree, toTreeNodes, expandedTreeReports]
    );

    useTreeViewScroll(highlightedReportId, nodes, listRef);

    const expandIfMatch = useCallback((item: ReportTree, searchTerm: string, newExpandedTreeReports: Set<string>) => {
        let hasMatchingChild = false;
        item.subReports.forEach((subReport) => {
            if (expandIfMatch(subReport, searchTerm, newExpandedTreeReports)) {
                hasMatchingChild = true;
            }
        });
        if (item.message.toLowerCase().includes(searchTerm.toLowerCase()) || hasMatchingChild) {
            newExpandedTreeReports.add(item.id);
            return true;
        }
        return false;
    }, []);

    const handleSearch = useCallback(
        (searchTerm: string) => {
            setSearchTerm(searchTerm);
            const matches: number[] = [];
            const newExpandedTreeReports = new Set(expandedTreeReports);

            expandIfMatch(reportTree, searchTerm, newExpandedTreeReports);

            const updatedExpandedTreeReports = Array.from(newExpandedTreeReports);
            setExpandedTreeReports(updatedExpandedTreeReports);

            const expandedNodes = toTreeNodes(reportTree, 0, updatedExpandedTreeReports);
            expandedNodes.forEach((node, index) => {
                if (node.label.toLowerCase().includes(searchTerm.toLowerCase())) {
                    matches.push(index);
                }
            });

            setSearchResults(matches);
            setCurrentResultIndex(matches.length > 0 ? 0 : -1);
        },
        [expandedTreeReports, expandIfMatch, reportTree, toTreeNodes, setExpandedTreeReports]
    );

    useEffect(() => {
        if (currentResultIndex >= 0 && searchResults.length > 0) {
            listRef.current?.scrollToItem(searchResults[currentResultIndex], 'end');
        }
    }, [currentResultIndex, searchResults]);

    const handleNavigate = useCallback(
        (direction: 'next' | 'previous') => {
            if (searchResults.length === 0) {
                return;
            }

            let newIndex;

            if (direction === 'next') {
                newIndex = (currentResultIndex + 1) % searchResults.length;
            } else {
                newIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
            }

            setCurrentResultIndex(newIndex);
        },
        [currentResultIndex, searchResults]
    );

    const resetSearch = useCallback(() => {
        setSearchTerm('');
        setSearchResults([]);
        setCurrentResultIndex(-1);
    }, []);

    return (
        <Box sx={styles.container}>
            <Box sx={styles.quickSearch}>
                <QuickSearch
                    currentResultIndex={currentResultIndex}
                    selectedReportId={reportTree.id}
                    onSearch={handleSearch}
                    onNavigate={handleNavigate}
                    resultCount={searchResults.length}
                    resetSearch={resetSearch}
                    placeholder="searchPlaceholderLogsTreeStructure"
                    style={{ minWidth: '80%' }}
                />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
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
                            itemData={{
                                nodes,
                                onSelectedItem,
                                onExpandItem,
                                highlightedReportId,
                                searchTerm,
                                currentResultIndex,
                                searchResults,
                            }}
                        >
                            {TreeviewItem}
                        </FixedSizeList>
                    )}
                </AutoSizer>
            </Box>
        </Box>
    );
};
