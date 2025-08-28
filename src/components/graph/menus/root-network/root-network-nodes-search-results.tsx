/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DeviceHubIcon, OverflowableText } from '@gridsuite/commons-ui';
import { Box, Divider } from '@mui/material';
import React from 'react';

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
        mb: 1,
    },
    iconMinSize: {
        minHeight: '20px',
        minWidth: '20px',
    },
};
export const RootNetworkNodesSearchResults: React.FC<RootNetworkNodesSearchResultsProps> = ({ results }) => {
    return (
        <Box sx={styles.container}>
            {results.map((result) => (
                <Box key={result + '_node'} sx={{ mb: 2 }}>
                    <Box sx={styles.rootNameTitle}>
                        <DeviceHubIcon style={styles.iconMinSize} />
                        <OverflowableText text={result} sx={{ marginLeft: '5px' }} maxLineCount={1} />
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                </Box>
            ))}
        </Box>
    );
};
