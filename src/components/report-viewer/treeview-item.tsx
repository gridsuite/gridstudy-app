/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CSSProperties, FunctionComponent, ReactNode, useCallback, useMemo } from 'react';
import { Box, Stack, Typography, styled, Theme, useTheme } from '@mui/material';
import * as React from 'react';
import { mergeSx } from '@gridsuite/commons-ui';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ListChildComponentProps } from 'react-window';

export interface ReportItem {
    id: string;
    icon?: ReactNode;
    label: string;
    depth: number;
    collapsed?: boolean;
    isCollapsable?: boolean;
    isLeaf?: boolean;
    isSelected?: boolean;
}

const styles = {
    content: (theme: Theme) => ({
        color: theme.palette.text.secondary,
        borderRadius: theme.spacing(2),
        width: 'fit-content',
        paddingRight: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
    }),
    labelText: (theme: Theme) => ({
        fontWeight: 'inherit',
        marginRight: theme.spacing(2),
    }),
    labelRoot: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 0),
    }),
    root: (theme: Theme) => ({
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    }),
    highlighted: (theme: Theme) => ({
        backgroundColor: theme.palette.action.hover,
    }),
};

const TreeViewItemBox = styled(Box)(() => {
    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        cursor: 'pointer',
    };
});

const TreeViewItemStack = styled(Stack)<{ left: number; node: ReportItem }>((props) => {
    const { left, theme, node } = props;

    return {
        position: 'absolute',
        left: `${left}px`,
        width: 'fit-content',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: node.isSelected ? `var(--tree-view-bg-color, ${theme.palette.action.selected})` : undefined,
        color: 'var(--tree-view-color)',
        padding: theme.spacing(0.5, 0, 0.5, 2),
        borderRadius: theme.spacing(2),
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    };
});

export interface TreeViewItemData {
    nodes: ReportItem[];
    onSelectedItem: (node: ReportItem) => void;
    onExpandItem: (node: ReportItem) => void;
    highlightedReportId?: string;
    searchTerm: string;
    currentResultIndex: number;
    searchResults: number[];
}

export interface TreeViewItemProps extends ListChildComponentProps {
    data: TreeViewItemData;
    index: number;
    style: CSSProperties;
}

const ITEM_DEPTH_OFFSET = 12;

export const TreeviewItem: FunctionComponent<TreeViewItemProps> = (props) => {
    const { data, index } = props;
    const { nodes, onSelectedItem, onExpandItem, highlightedReportId, searchTerm, currentResultIndex, searchResults } =
        data;
    const currentNode = nodes[index];
    const left = currentNode.depth * ITEM_DEPTH_OFFSET;
    const isCollapsable = currentNode.isCollapsable ?? true;
    const theme = useTheme();

    const handleClick = useCallback(() => {
        onSelectedItem(currentNode);
    }, [onSelectedItem, currentNode]);

    const handleExpand = useCallback(() => {
        onExpandItem(currentNode);
    }, [onExpandItem, currentNode]);

    const highlightText = useMemo(
        () => (text: string, highlight: string) => {
            if (!highlight) {
                return text;
            }
            const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
            return parts.map((part, partIndex) => {
                if (part.toLowerCase() === highlight.toLowerCase()) {
                    const isCurrentOccurrence = searchResults[currentResultIndex] === index;
                    return (
                        <span
                            key={`${part}-${partIndex}`}
                            style={{
                                backgroundColor: isCurrentOccurrence
                                    ? theme.searchedText.currentHighlightColor
                                    : theme.searchedText.highlightColor,
                            }}
                        >
                            {part}
                        </span>
                    );
                }
                return part;
            });
        },
        [searchResults, currentResultIndex, index, theme]
    );

    return (
        <TreeViewItemBox sx={mergeSx(styles.content, styles.labelRoot)} style={props.style}>
            <TreeViewItemStack
                direction="row"
                left={left}
                node={currentNode}
                sx={mergeSx(styles.root, highlightedReportId === currentNode.id ? styles.highlighted : undefined)}
            >
                {isCollapsable && (
                    <Box
                        component={currentNode.collapsed ? ArrowRightIcon : ArrowDropDownIcon}
                        sx={{ visibility: currentNode.isLeaf ? 'hidden' : 'visible', fontSize: '18px' }}
                        onClick={handleExpand}
                    />
                )}
                {currentNode.icon}
                <Typography variant="body2" sx={styles.labelText} onClick={handleClick}>
                    {highlightText(currentNode.label, searchTerm)}
                </Typography>
            </TreeViewItemStack>
        </TreeViewItemBox>
    );
};
