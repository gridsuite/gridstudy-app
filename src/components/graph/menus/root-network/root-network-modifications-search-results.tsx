/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Divider } from '@mui/material';
import { DeviceHubIcon, OverflowableText } from '@gridsuite/commons-ui';
import { ModificationsSearchResult } from './root-network.types';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { AppState } from '../../../../redux/reducer';
import { UUID } from 'crypto';
import { ModificationResults } from './root-network-modification-results';

const styles = {
    container: {
        mt: 2,
        maxHeight: '500px',
        overflowY: 'auto',
    },
    rootNameTitle: {
        display: 'flex',
        alignItems: 'center',
        mb: 1,
    },
    iconMinSize: {
        minHeight: '15px',
        minWidth: '15px',
    },
    text: {
        marginLeft: '5px',
    },
};

interface RootNetworkModificationsSearchResultsProps {
    results: ModificationsSearchResult[];
}

export const RootNetworkModificationsSearchResults: React.FC<RootNetworkModificationsSearchResultsProps> = ({
    results,
}) => {
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    //get the name based on the node uuid from the node tree
    const getName = useCallback(
        (idToFind: UUID) => {
            if (!treeNodes) {
                return null;
            }
            const node = treeNodes.find((node) => node.id === idToFind);
            return node?.data.label;
        },
        [treeNodes]
    );
    return (
        <Box sx={styles.container}>
            {results.map((result) => (
                <Box key={result.nodeUuid} sx={{ mb: 2 }}>
                    <Box sx={styles.rootNameTitle}>
                        <DeviceHubIcon style={styles.iconMinSize} />
                        <OverflowableText text={getName(result.nodeUuid)} sx={styles.text} maxLineCount={1} />
                    </Box>
                    <ModificationResults modifications={result.modifications} />
                    <Divider sx={{ mt: 2 }} />
                </Box>
            ))}
        </Box>
    );
};
