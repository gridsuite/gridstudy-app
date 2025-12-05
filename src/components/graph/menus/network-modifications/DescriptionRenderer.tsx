/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ICellRendererParams } from 'ag-grid-community';
import { DescriptionModificationDialog, EditNoteIcon, NetworkModificationMetadata } from '@gridsuite/commons-ui';
import React, { SetStateAction, useCallback, useState } from 'react';
import { Tooltip } from '@mui/material';
import { useIsAnyNodeBuilding } from '../../../utils/is-any-node-building-hook';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import IconButton from '@mui/material/IconButton';
import type { UUID } from 'node:crypto';
import { setModificationDescription } from '../../../../services/study/network-modifications';

export interface DescriptionRendererProps extends ICellRendererParams<NetworkModificationMetadata> {
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
}

const DescriptionRenderer = (props: DescriptionRendererProps) => {
    const { data, api, setModifications } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);
    const [openDescModificationDialog, setOpenDescModificationDialog] = useState(false);

    const modificationUuid = data?.uuid;
    const description: string | undefined = data?.description;

    const updateModification = useCallback(
        async (uuid: UUID, descriptionRecord: Record<string, string>) => {
            // TODO ? typer element autrement ? cf commons-ui DescriptionModificationDialog.tsx l64
            /*if (!uuid || !description) {
                return;
            }*/
            setIsLoading(true);

            setModifications((oldModifications) => {
                const modificationToUpdateIndex = oldModifications.findIndex((m) => m.uuid === uuid);
                if (modificationToUpdateIndex === -1) {
                    return oldModifications;
                }
                const newModifications = [...oldModifications];

                newModifications[modificationToUpdateIndex] = {
                    ...newModifications[modificationToUpdateIndex],
                };

                return newModifications;
            });

            return setModificationDescription(studyUuid, currentNode?.id, uuid, descriptionRecord.description).finally(
                () => {
                    setIsLoading(false);
                }
            );
        },
        [setModifications, studyUuid, currentNode?.id]
    );

    const handleDescDialogClose = useCallback(() => {
        setOpenDescModificationDialog(false);
        api.stopEditing();
    }, [api]);

    const handleModifyDescription = () => {
        if (isLoading) {
            return;
        }
        setOpenDescModificationDialog(true);
    };
    console.log('description : ', description);

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
            <Tooltip title={description} arrow>
                <IconButton
                    color="primary"
                    onClick={handleModifyDescription}
                    disabled={isLoading || isAnyNodeBuilding || mapDataLoading}
                >
                    <EditNoteIcon empty={description === undefined || description === ''} />
                </IconButton>
            </Tooltip>
        </>
    );
};

export default DescriptionRenderer;
