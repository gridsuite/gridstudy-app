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
import { setCentedNode, setCurrentTreeNode, setHighlightModification, setModificationsDrawerOpen } from 'redux/actions';
import { StudyDisplayMode } from 'components/network-modification.type';
import { useDisplayModes } from 'hooks/use-display-modes';

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
};
export const ModificationResults: React.FC<ModificationResultsProps> = ({ modifications, nodeUuid }) => {
    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const dispatch = useDispatch();
    const toggleOptions = useSelector((state: AppState) => state.toggleOptions);
    const { applyModes } = useDisplayModes();

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
            dispatch(setModificationsDrawerOpen());
            const node = treeNodes?.find((node) => node.id === nodeUuid);
            if (node) {
                dispatch(setCurrentTreeNode(node));
                dispatch(setCentedNode(node));
            }
            if (toggleOptions.includes(StudyDisplayMode.EVENT_SCENARIO)) {
                applyModes(toggleOptions.filter((option) => option !== StudyDisplayMode.EVENT_SCENARIO));
            }

            dispatch(setHighlightModification(modification.modificationUuid));
        },
        [applyModes, dispatch, nodeUuid, toggleOptions, treeNodes]
    );

    return (
        <>
            {modifications.map((modification) => (
                <Box sx={styles.itemHover} key={modification.impactedEquipmentId + modification.modificationUuid}>
                    <Typography
                        variant="body2"
                        onClick={() => handleClick(modification)}
                        sx={{ cursor: 'pointer', pt: 0.5, pb: 0.5 }}
                    >
                        <strong>{modification.impactedEquipmentId + ' - '}</strong> {getModificationLabel(modification)}
                    </Typography>
                </Box>
            ))}
        </>
    );
};
