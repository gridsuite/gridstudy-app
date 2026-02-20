/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { SetStateAction } from 'react';
import { Badge, Box, Checkbox } from '@mui/material';
import { NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { ColumnDef } from '@tanstack/react-table';
import DragHandleCell from './renderers/drag-handle-cell-renderer';
import { NetworkModificationEditorNameHeader } from './renderers/network-modification-node-editor-name-header';
import NetworkModificationNameCell from './renderers/network-modification-name-cell-renderer';
import DescriptionCellRenderer from './renderers/description-cell-renderer';
import SwitchCellRenderer from './renderers/switch-cell-renderer';
import { ExcludedNetworkModifications } from '../network-modification-menu.type';
import RootNetworkChipCellRenderer from '../root-network-chip-cell-renderer';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';

export const createStaticColumns = (
    isRowDragDisabled: boolean,
    modifications: NetworkModificationMetadata[],
    nameHeaderProps: any,
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>
): ColumnDef<NetworkModificationMetadata>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                size="small"
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                size="small"
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                onClick={(e) => e.stopPropagation()}
            />
        ),
        size: 40,
        meta: {
            cellStyle: { padding: 2 },
        },
    },
    {
        id: 'dragHandle',
        cell: () => <DragHandleCell isRowDragDisabled={isRowDragDisabled} />,
        size: 20,
    },
    {
        id: 'modificationName',
        header: () => (
            <NetworkModificationEditorNameHeader modificationCount={modifications?.length} {...nameHeaderProps} />
        ),
        cell: ({ row }) => <NetworkModificationNameCell row={row} />,
        meta: {
            cellStyle: { cursor: 'pointer', minWidth: 0, overflow: 'hidden', flex: 1, paddingLeft: '0.8vw' },
        },
    },
    {
        id: 'modificationDescription',
        cell: ({ row }) => <DescriptionCellRenderer data={row.original} />,
        size: 40,
    },
    {
        id: 'switch',
        cell: ({ row }) => <SwitchCellRenderer data={row.original} setModifications={setModifications} />,
        minSize: 60,
    },
];

export const createDynamicColumns = (
    rootNetworks: any[],
    currentRootNetworkUuid: string,
    modificationsCount: number,
    modificationsToExclude: ExcludedNetworkModifications[],
    setModificationsToExclude: React.Dispatch<SetStateAction<ExcludedNetworkModifications[]>>
): ColumnDef<NetworkModificationMetadata>[] => {
    return rootNetworks.map((rootNetwork) => {
        const rootNetworkUuid = rootNetwork.rootNetworkUuid;
        const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;

        return {
            id: rootNetworkUuid,
            header: () =>
                isCurrentRootNetwork && modificationsCount >= 1 ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Badge overlap="circular" color="primary" variant="dot">
                            <RemoveRedEyeIcon />
                        </Badge>
                    </Box>
                ) : null,
            cell: ({ row }) => (
                <RootNetworkChipCellRenderer
                    data={row.original}
                    rootNetwork={rootNetwork}
                    modificationsToExclude={modificationsToExclude}
                    setModificationsToExclude={setModificationsToExclude}
                />
            ),
            size: 72,
            meta: {
                cellStyle: { textAlign: 'center' },
            },
        };
    });
};
