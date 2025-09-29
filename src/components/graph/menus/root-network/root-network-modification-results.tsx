/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useIntl } from 'react-intl';
import { useModificationLabelComputer } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { Modification } from './root-network.types';
import { Box, Theme, Typography } from '@mui/material';
import { UUID } from 'crypto';
import { AppState } from 'redux/reducer';
import { useDispatch, useSelector } from 'react-redux';
import { setHighlightModification, setModificationsDrawerOpen } from 'redux/actions';
import { useSyncNavigationActions } from 'hooks/use-sync-navigation-actions';
import { useTreeNodeFocus } from 'hooks/use-tree-node-focus';

interface ModificationResultsProps {
    modifications: Modification[];
    nodeUuid: UUID;
}

const styles = {
    itemHover: (theme: Theme) => ({
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.aggrid.highlightColor,
        },
    }),
    modificationLabel: {
        cursor: 'pointer',
        pt: 0.5,
        pb: 0.5,
        pl: 0.5,
    },
};
export const ModificationResults: React.FC<ModificationResultsProps> = ({ modifications, nodeUuid }) => {
    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const triggerTreeNodeFocus = useTreeNodeFocus();
    const { setCurrentTreeNodeWithSync } = useSyncNavigationActions();
    const dispatch = useDispatch();

    const getModificationLabel = useCallback(
        (modification?: Modification): React.ReactNode => {
            if (!modification) {
                return '';
            }

            return intl.formatMessage(
                { id: 'network_modifications.' + modification.messageType },
                {
                    // @ts-ignore
                    ...computeLabel(modification, false),
                }
            );
        },
        [computeLabel, intl]
    );

    const handleClick = useCallback(
        (modification: Modification) => {
            const node = treeNodes?.find((node) => node.id === nodeUuid);
            if (node) {
                setCurrentTreeNodeWithSync(node);
                triggerTreeNodeFocus();
            }
            dispatch(setModificationsDrawerOpen());
            dispatch(setHighlightModification(modification.modificationUuid));
        },
        [dispatch, nodeUuid, setCurrentTreeNodeWithSync, treeNodes, triggerTreeNodeFocus]
    );

    return (
        <>
            {modifications.map((modification) => (
                <Box sx={styles.itemHover} key={modification.impactedEquipmentId + modification.modificationUuid}>
                    <Typography variant="body2" onClick={() => handleClick(modification)} sx={styles.modificationLabel}>
                        <strong>{modification.impactedEquipmentId + ' - '}</strong> {getModificationLabel(modification)}
                    </Typography>
                </Box>
            ))}
        </>
    );
};
