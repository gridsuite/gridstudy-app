/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DescriptionModificationDialog, EditNoteIcon } from '@gridsuite/commons-ui';
import { FunctionComponent, useCallback, useState } from 'react';
import { Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import { useIsAnyNodeBuilding } from '../../../../../utils/is-any-node-building-hook';
import { createEditDescriptionStyle } from '../network-modification-table-styles';
import { setModificationMetadata } from '../../../../../../services/study/network-modifications';
import { AppState } from '../../../../../../redux/reducer.type';
import { ComposedModificationMetadata } from '../utils';
import { FormattedMessage } from 'react-intl';

const DescriptionCell: FunctionComponent<{ data: ComposedModificationMetadata }> = (props) => {
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
        async (descriptionRecord: Record<string, string>) => {
            setIsLoading(true);

            return setModificationMetadata(studyUuid, currentNode?.id, modificationUuid, {
                description: descriptionRecord.description,
                type: data?.type,
            }).finally(() => {
                setIsLoading(false);
            });
        },
        [studyUuid, currentNode?.id, modificationUuid, data?.type]
    );

    const handleDescDialogClose = useCallback(() => {
        setOpenDescModificationDialog(false);
    }, []);

    const handleModifyDescription = useCallback(() => {
        setOpenDescModificationDialog(true);
    }, []);

    return (
        <>
            {openDescModificationDialog && modificationUuid && (
                <DescriptionModificationDialog
                    open
                    description={description ?? ''}
                    onClose={handleDescDialogClose}
                    updateElement={updateModification}
                />
            )}
            <Tooltip title={description ?? <FormattedMessage id={'addDescription'} />} arrow placement="right">
                <span>
                    <IconButton
                        onClick={handleModifyDescription}
                        disabled={isLoading || isAnyNodeBuilding || mapDataLoading}
                        sx={createEditDescriptionStyle(data.description)}
                    >
                        <EditNoteIcon empty={empty} />
                    </IconButton>
                </span>
            </Tooltip>
        </>
    );
};

export default DescriptionCell;
