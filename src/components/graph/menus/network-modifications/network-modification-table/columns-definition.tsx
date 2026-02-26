/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { SetStateAction } from 'react';
import { Badge, Box } from '@mui/material';
import { NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { ColumnDef } from '@tanstack/react-table';
import DragHandleCell from './renderers/drag-handle-cell';
import {
    NetworkModificationEditorNameHeader,
    NetworkModificationEditorNameHeaderProps,
} from './renderers/network-modification-node-editor-name-header';
import NameCell from './renderers/name-cell';
import DescriptionCell from './renderers/description-cell';
import SwitchCell from './renderers/switch-cell';
import { ExcludedNetworkModifications, RootNetworkMetadata } from '../network-modification-menu.type';
import RootNetworkChipCell from './renderers/root-network-chip-cell';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import SelectCell from './renderers/select-cell';
import SelectHeaderCell from './renderers/select-header-cell';
import { createRootNetworkChipCellSx, styles } from './styles';

const CHIP_PADDING_PX = 24;
const CHAR_WIDTH_PX = 8;
const COLUMN_PADDING_PX = 12;
const MIN_COLUMN_SIZE = 40;

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
    NAME: {
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

type NameHeaderProps = Omit<NetworkModificationEditorNameHeaderProps, 'modificationCount'>;

/**
 * Column definition is broken up in 2 parts : static columns which are always on display and dynamic columns which are
 * linked to the notion of root networks. Since the amount of root network is inbetween 1-4 and we want to be able to
 * control the status of a modification for each individual root network they all have a dedicated column generated
 * on the fly
 */

export const createStaticColumns = (
    isRowDragDisabled: boolean,
    modificationsCount: number,
    nameHeaderProps: NameHeaderProps,
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
        header: ({ table }) => <SelectHeaderCell table={table} />,
        cell: ({ row, table }) => <SelectCell row={row} table={table} />,
        size: 40,
        minSize: 40,
        meta: {
            cellStyle: styles.columnCell.select,
        },
    },
    {
        id: STATIC_MODIFICATION_TABLE_COLUMNS.NAME.id,
        header: () => (
            <NetworkModificationEditorNameHeader modificationCount={modificationsCount} {...nameHeaderProps} />
        ),
        cell: ({ row }) => <NameCell row={row} />,
        meta: {
            cellStyle: styles.columnCell.modificationName,
        },
        minSize: 160,
    },
    {
        id: STATIC_MODIFICATION_TABLE_COLUMNS.DESCRIPTION.id,
        cell: ({ row }) => <DescriptionCell data={row.original} />,
        size: 40,
        minSize: 32,
    },
    {
        id: STATIC_MODIFICATION_TABLE_COLUMNS.SWITCH.id,
        cell: ({ row }) => <SwitchCell data={row.original} setModifications={setModifications} />,
        size: 64,
        minSize: 40,
    },
];

export const createDynamicColumns = (
    rootNetworks: RootNetworkMetadata[],
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
                    <Box sx={styles.rootNetworkHeader}>
                        <Badge overlap="circular" color="primary" variant="dot">
                            <RemoveRedEyeIcon />
                        </Badge>
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
                cellStyle: styles.columnCell.rootNetworkChip,
            },
        };
    });
};
