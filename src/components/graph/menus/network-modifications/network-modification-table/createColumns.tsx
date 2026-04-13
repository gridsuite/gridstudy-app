/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    BASE_MODIFICATION_TABLE_COLUMNS,
    ComposedModificationMetadata,
    computeTagMinSize,
    createRootNetworkChipCellSx,
    DragHandleCell,
    ExcludedNetworkModifications,
    NameCell,
    NameHeaderProps,
    NetworkModificationEditorNameHeader,
    NetworkModificationMetadata,
    networkModificationTableStyles,
    SelectCell,
    SelectHeaderCell,
} from '@gridsuite/commons-ui';
import React, { SetStateAction } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DescriptionCell from './renderers/description-cell';
import SwitchCell from './renderers/switch-cell';
import { RootNetworkMetadata } from '../network-modification-menu.type';
import { Badge, Box, Tooltip } from '@mui/material';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import RootNetworkChipCell from './renderers/root-network-chip-cell';
import { FormattedMessage } from 'react-intl';

/**
 * Column definition is broken up in 2 parts : base columns which are always on display and root networks columns.
 * Since the amount of root network is inbetween 1-4 and we want to be able to control the status of a modification
 * for each individual root network hence they all have a dedicated column generated on the fly
 */

export const createBaseColumns = (
    isRowDragDisabled: boolean,
    modificationsCount: number,
    nameHeaderProps: NameHeaderProps,
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>
): ColumnDef<ComposedModificationMetadata>[] => [
    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.DRAG_HANDLE.id,
        cell: () => <DragHandleCell isRowDragDisabled={isRowDragDisabled} />,
        size: 24,
        minSize: 24,
        meta: {
            cellStyle: {
                justifyContent: 'center',
            },
        },
    },
    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.SELECT.id,
        header: ({ table }) => <SelectHeaderCell table={table} />,
        cell: ({ row, table }) => <SelectCell row={row} table={table} />,
        size: 32,
        minSize: 32,
        meta: {
            cellStyle: networkModificationTableStyles.columnCell.select,
        },
    },
    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.NAME.id,
        header: () => (
            <NetworkModificationEditorNameHeader modificationCount={modificationsCount} {...nameHeaderProps} />
        ),
        cell: ({ row }) => <NameCell row={row} />,
        meta: {
            cellStyle: networkModificationTableStyles.columnCell.modificationName,
        },
        minSize: 160,
    },
    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.DESCRIPTION.id,
        cell: ({ row }) => <DescriptionCell data={row.original} />,
        size: 40,
        minSize: 32,
    },
    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.SWITCH.id,
        cell: ({ row }) => <SwitchCell data={row.original} setModifications={setModifications} />,
        size: 48,
        minSize: 48,
        meta: {
            cellStyle: {
                paddingRight: '5px',
            },
        },
    },
];

export const createRootNetworksColumns = (
    rootNetworks: RootNetworkMetadata[],
    currentRootNetworkUuid: string,
    modificationsCount: number,
    modificationsToExclude: ExcludedNetworkModifications[],
    setModificationsToExclude: React.Dispatch<SetStateAction<ExcludedNetworkModifications[]>>
): ColumnDef<NetworkModificationMetadata>[] => {
    const tagMinSizes = rootNetworks.map((rootNetwork) => computeTagMinSize(rootNetwork.tag ?? ''));
    const sharedSize = Math.max(Math.min(...tagMinSizes), 56);
    const currentRootNetworkTag = rootNetworks.find((item) => item.rootNetworkUuid === currentRootNetworkUuid)?.tag;

    return rootNetworks.map((rootNetwork, index) => {
        const rootNetworkUuid = rootNetwork.rootNetworkUuid;
        const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;
        const tagMinSize = tagMinSizes[index];

        return {
            id: rootNetworkUuid,
            header: () =>
                isCurrentRootNetwork && modificationsCount >= 1 ? (
                    <Box sx={networkModificationTableStyles.rootNetworkHeader}>
                        <Tooltip
                            title={
                                <FormattedMessage
                                    id={'visualizedRootNetwork'}
                                    values={{ tag: currentRootNetworkTag }}
                                />
                            }
                        >
                            <Badge overlap="circular" color="primary" variant="dot">
                                <RemoveRedEyeIcon />
                            </Badge>
                        </Tooltip>
                    </Box>
                ) : null,
            cell: ({ row }) => (
                <Box sx={createRootNetworkChipCellSx(row.original.activated)}>
                    <RootNetworkChipCell
                        data={row.original}
                        rootNetwork={rootNetwork}
                        modificationsToExclude={modificationsToExclude}
                        setModificationsToExclude={setModificationsToExclude}
                    />
                </Box>
            ),
            size: sharedSize,
            minSize: tagMinSize,
            meta: {
                cellStyle: networkModificationTableStyles.columnCell.rootNetworkChip,
            },
        };
    });
};
