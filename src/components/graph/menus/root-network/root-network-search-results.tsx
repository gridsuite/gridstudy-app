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
import { useSelector } from 'react-redux';
import type { AppState } from '../../../../redux/reducer';
import { UUID } from 'crypto';

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
        (modification?: Modification): React.ReactNode => {
            if (!modification) {
                return '';
            }

            return intl.formatMessage(
                { id: 'network_modifications.' + modification.messageType },
                {
                    // @ts-ignore
                    ...computeLabel(modification),
                }
            );
        },
        [computeLabel, intl]
    );
    return (
        <>
            {modifications.map((modification, key) => (
                <Typography key={key} variant="body2">
                    <strong>{modification.impactedEquipmentId + ' - '}</strong> {getModificationLabel(modification)}
                </Typography>
            ))}
        </>
    );
};

export const RootNetworkSearchResults: React.FC<RootNetworkSearchResultsProps> = ({ results }) => {
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    //get the name based on the node tree
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
            {results.map((result, key) => (
                <Box key={key} sx={{ mb: 2 }}>
                    <Box sx={styles.rootNameTitle}>
                        <DeviceHubIcon />
                        <Typography color="textSecondary" sx={{ marginLeft: '5px' }}>
                            {getName(result.nodeUuid)}
                        </Typography>
                    </Box>
                    <ModificationResults modifications={result.modifications} />
                    <Divider sx={{ mt: 2 }} />
                </Box>
            ))}
        </Box>
    );
};
