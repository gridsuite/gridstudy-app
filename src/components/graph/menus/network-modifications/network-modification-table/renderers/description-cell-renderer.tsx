/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    DescriptionModificationDialog,
    EditNoteIcon,
    mergeSx,
    NetworkModificationMetadata,
} from '@gridsuite/commons-ui';
import { useCallback, useState } from 'react';
import { Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import type { UUID } from 'node:crypto';
import { AppState } from '../../../../../../redux/reducer';
import { useIsAnyNodeBuilding } from '../../../../../utils/is-any-node-building-hook';
import { setModificationMetadata } from '../../../../../../services/study/network-modifications';
import { styles } from '../styles';

export interface DescriptionRendererProps {
    data: NetworkModificationMetadata;
}

const DescriptionCellRenderer = (props: DescriptionRendererProps) => {
    const { data } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);
    const [openDescModificationDialog, setOpenDescModificationDialog] = useState(false);

    const modificationUuid = data?.uuid;
    const description = data?.description;
    const empty = !description;

    const updateModification = useCallback(
        async (uuid: UUID, descriptionRecord: Record<string, string>) => {
            setIsLoading(true);

            return setModificationMetadata(studyUuid, currentNode?.id, uuid, {
                description: descriptionRecord.description,
                type: data?.type,
            }).finally(() => {
                setIsLoading(false);
            });
        },
        [studyUuid, currentNode?.id, data?.type]
    );

    const handleDescDialogClose = useCallback(() => {
        setOpenDescModificationDialog(false);
    }, []);

    const handleModifyDescription = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click from firing
        setOpenDescModificationDialog(true);
    }, []);

    return (
        <>
            {openDescModificationDialog && modificationUuid && (
                <DescriptionModificationDialog
                    open
                    description={description ?? ''}
                    elementUuid={modificationUuid}
                    onClose={handleDescDialogClose}
                    updateElement={updateModification}
                />
            )}
            <Tooltip title={description} arrow placement="right">
                <IconButton
                    className="editDescription"
                    onClick={handleModifyDescription}
                    disabled={isLoading || isAnyNodeBuilding || mapDataLoading}
                    sx={mergeSx(styles.coloredButton, styles.editDescription)}
                >
                    <EditNoteIcon empty={empty} />
                </IconButton>
            </Tooltip>
        </>
    );
};

export default DescriptionCellRenderer;
