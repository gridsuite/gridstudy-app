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
import RootNetworkChipCellRenderer from './renderers/root-network-chip-cell-renderer';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';

const CHIP_PADDING_PX = 24; // horizontal padding inside the chip
const CHAR_WIDTH_PX = 8; // approximate px per character
const COLUMN_PADDING_PX = 12; // cell padding around the chip
const MIN_COLUMN_SIZE = 40; // absolute floor

const computeTagMinSize = (tag: string): number => {
    const chipContentWidth = tag.length * CHAR_WIDTH_PX + CHIP_PADDING_PX;
    return Math.max(chipContentWidth + COLUMN_PADDING_PX, MIN_COLUMN_SIZE);
};

export const STATIC_MODIFICATION_TABLE_COLUMNS = {
    SELECT: {
        id: 'select',
        autoExtensible: false,
    },
    DRAG_HANDLE: {
        id: 'dragHandle',
        autoExtensible: false,
    },
    MODIFICATION_NAME: {
        id: 'modificationName',
        autoExtensible: true,
    },
    DESCRIPTION: {
        id: 'modificationDescription',
        autoExtensible: false,
    },
    SWITCH: {
        id: 'switch',
        autoExtensible: false,
    },
};

export const AUTO_EXTENSIBLE_COLUMNS = Object.values(STATIC_MODIFICATION_TABLE_COLUMNS)
    .filter((column) => column.autoExtensible)
    .map((column) => column.id);

export const createStaticColumns = (
    isRowDragDisabled: boolean,
    modifications: NetworkModificationMetadata[],
    nameHeaderProps: any,
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>
): ColumnDef<NetworkModificationMetadata>[] => [
    {
        id: STATIC_MODIFICATION_TABLE_COLUMNS.DRAG_HANDLE.id,
        cell: () => <DragHandleCell isRowDragDisabled={isRowDragDisabled} />,
        size: 24,
        minSize: 24,
    },
    {
        id: STATIC_MODIFICATION_TABLE_COLUMNS.SELECT.id,
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
        minSize: 40,
        meta: {
            cellStyle: { padding: 2, justifyContent: 'center' },
        },
    },
    {
        id: STATIC_MODIFICATION_TABLE_COLUMNS.MODIFICATION_NAME.id,
        header: () => (
            <NetworkModificationEditorNameHeader modificationCount={modifications?.length} {...nameHeaderProps} />
        ),
        cell: ({ row }) => <NetworkModificationNameCell row={row} />,
        meta: {
            cellStyle: { cursor: 'pointer', minWidth: 0, overflow: 'hidden', flex: 1, paddingLeft: '0.8vw' },
        },
        minSize: 400,
    },
    {
        id: STATIC_MODIFICATION_TABLE_COLUMNS.DESCRIPTION.id,
        cell: ({ row }) => <DescriptionCellRenderer data={row.original} />,
        size: 40,
        minSize: 32,
    },
    {
        id: STATIC_MODIFICATION_TABLE_COLUMNS.SWITCH.id,
        cell: ({ row }) => <SwitchCellRenderer data={row.original} setModifications={setModifications} />,
        size: 64,
        minSize: 40,
    },
];

export const createDynamicColumns = (
    rootNetworks: any[],
    currentRootNetworkUuid: string,
    modificationsCount: number,
    modificationsToExclude: ExcludedNetworkModifications[],
    setModificationsToExclude: React.Dispatch<SetStateAction<ExcludedNetworkModifications[]>>
): ColumnDef<NetworkModificationMetadata>[] => {
    const tagMinSizes = rootNetworks.map((rootNetwork) => computeTagMinSize(rootNetwork.tag ?? ''));
    const sharedSize = Math.max(Math.min(...tagMinSizes), 56);

    return rootNetworks.map((rootNetwork, index) => {
        const rootNetworkUuid = rootNetwork.rootNetworkUuid;
        const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;
        const tagMinSize = tagMinSizes[index];

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
                <Box
                    sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    style={{ opacity: row.original.activated ? 1 : 0.4 }}
                >
                    <RootNetworkChipCellRenderer
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
                cellStyle: { textAlign: 'center' },
            },
        };
    });
};
