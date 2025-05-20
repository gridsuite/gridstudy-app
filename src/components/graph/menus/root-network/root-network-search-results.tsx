/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Divider, Typography } from '@mui/material';
import { DeviceHubIcon, useModificationLabelComputer } from '@gridsuite/commons-ui';
import { Modification, ModificationsSearchResult } from './root-network.types';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';

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

interface RootNetworkSearchResultsProps {
    results: ModificationsSearchResult[];
}
interface ModificationResultsProps {
    modifications: Modification[];
}

const ModificationResults: React.FC<ModificationResultsProps> = ({ modifications }) => {
    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();

    const getModificationLabel = useCallback(
        (modif?: Modification): React.ReactNode => {
            if (!modif) {
                return '';
            }

            // @ts-ignore
            return intl.formatMessage({ id: 'root_network.' + modif.messageType }, { ...computeLabel(modif) });
        },
        [computeLabel, intl]
    );
    return (
        <>
            {modifications.map((modification, key) => (
                <Typography key={key} variant="body2">
                    {getModificationLabel(modification)}
                </Typography>
            ))}
        </>
    );
};

export const RootNetworkSearchResults: React.FC<RootNetworkSearchResultsProps> = ({ results }) => {
    return (
        <Box sx={styles.container}>
            {results.map((result, key) => (
                <Box key={key} sx={{ mb: 2 }}>
                    <Box sx={styles.rootNameTitle}>
                        <DeviceHubIcon />
                        <Typography color="textSecondary" sx={{ marginLeft: '5px' }}>
                            {result.basicNodeInfos.name}
                        </Typography>
                    </Box>
                    <ModificationResults modifications={result.modifications} />
                    <Divider sx={{ mt: 2 }} />
                </Box>
            ))}
        </Box>
    );
};
