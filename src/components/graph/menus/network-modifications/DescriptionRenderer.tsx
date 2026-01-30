/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ICellRendererParams } from 'ag-grid-community';
import {
    DescriptionModificationDialog,
    EditNoteIcon,
    MuiStyles,
    NetworkModificationMetadata,
} from '@gridsuite/commons-ui';
import { useCallback, useState } from 'react';
import { Tooltip } from '@mui/material';
import { useIsAnyNodeBuilding } from '../../../utils/is-any-node-building-hook';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import IconButton from '@mui/material/IconButton';
import type { UUID } from 'node:crypto';
import { setModificationMetadata } from '../../../../services/study/network-modifications';

const styles = {
    coloredButton: (theme) => ({
        color: theme.palette.text.primary,
    }),
} as const satisfies MuiStyles;

export interface DescriptionRendererProps extends ICellRendererParams<NetworkModificationMetadata> {
    hoveredRowIndex: number;
}

const DescriptionRenderer = (props: DescriptionRendererProps) => {
    const { hoveredRowIndex, data, api, node } = props;
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
        api.stopEditing();
    }, [api, setOpenDescModificationDialog]);

    const handleModifyDescription = useCallback(() => {
        setOpenDescModificationDialog(true);
    }, [setOpenDescModificationDialog]);

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
                    onClick={handleModifyDescription}
                    disabled={isLoading || isAnyNodeBuilding || mapDataLoading}
                    sx={styles.coloredButton}
                >
                    <EditNoteIcon empty={empty} visibility={hoveredRowIndex === node.rowIndex ? 'visible' : 'hidden'} />
                </IconButton>
            </Tooltip>
        </>
    );
};

export default DescriptionRenderer;
