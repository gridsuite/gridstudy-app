/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Divider, Theme } from '@mui/material';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { DeviceHubIcon, type MuiStyles, OverflowableText } from '@gridsuite/commons-ui';
import { useSyncNavigationActions } from 'hooks/use-sync-navigation-actions';
import { useTreeNodeFocus } from 'hooks/use-tree-node-focus';

interface RootNetworkNodesSearchResultsProps {
    results: string[];
}
const styles = {
    container: {
        mt: 2,
        maxHeight: '500px',
        overflowY: 'auto',
    },
    rootNameTitle: {
        display: 'flex',
        alignItems: 'center',
        pt: 1,
        mb: 1,
    },
    itemHover: (theme: Theme) => ({
        mb: 1,
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.aggrid.highlightColor,
        },
    }),
    iconMinSize: {
        minHeight: '20px',
        minWidth: '20px',
    },
} as const satisfies MuiStyles;

export const RootNetworkNodesSearchResults: React.FC<RootNetworkNodesSearchResultsProps> = ({ results }) => {
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const { setCurrentTreeNodeWithSync } = useSyncNavigationActions();
    const triggerTreeNodeFocus = useTreeNodeFocus();

    const handleClick = useCallback(
        (nodeName: string) => {
            const node = treeNodes?.find((node) => node.data.label === nodeName);
            if (node) {
                setCurrentTreeNodeWithSync(node);
                triggerTreeNodeFocus();
            }
        },
        [setCurrentTreeNodeWithSync, treeNodes, triggerTreeNodeFocus]
    );

    return (
        <Box sx={styles.container}>
            {results.map((result) => (
                <Box key={result + '_node'} sx={styles.itemHover}>
                    <Box sx={styles.rootNameTitle} onClick={() => handleClick(result)}>
                        <DeviceHubIcon style={styles.iconMinSize} />
                        <OverflowableText text={result} sx={{ marginLeft: '5px' }} maxLineCount={1} />
                    </Box>
                    <Divider />
                </Box>
            ))}
        </Box>
    );
};
