import { DeviceHubIcon } from '@gridsuite/commons-ui';
import { Box, Divider, Typography } from '@mui/material';
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
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        mb: 1,
    },
};
export const RootNetworkNodesSearchResults: React.FC<RootNetworkNodesSearchResultsProps> = ({ results }) => {
    return (
        <Box sx={styles.container}>
            {results.map((result) => (
                <Box key={result + '_node'} sx={{ mb: 2 }}>
                    <Box sx={styles.rootNameTitle}>
                        <DeviceHubIcon />
                        <Typography sx={{ marginLeft: '5px' }}>{result}</Typography>
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                </Box>
            ))}
        </Box>
    );
};
