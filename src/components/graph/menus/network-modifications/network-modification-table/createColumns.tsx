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
    DescriptionCellRenderer,
    DragHandleRenderer,
    NameCellRenderer,
    NameHeaderRenderer,
    networkModificationTableStyles,
    RootNetworkCellRenderer,
    RootNetworkHeaderRenderer,
    SelectCellRenderer,
    SelectHeaderRenderer,
    ReferenceCellRenderer,
    SwitchCellRenderer,
} from '@gridsuite/commons-ui';
import { ColumnDef } from '@tanstack/react-table';
import { RootNetworkMetadata } from '../network-modification-menu.type';

/**
 * Column definition is broken up in 2 parts : base columns which are always on display and root networks columns.
 * Since the amount of root network is inbetween 1-4 and we want to be able to control the status of a modification
 * for each individual root network hence they all have a dedicated column generated on the fly
 */

export const createBaseColumns = (
    onNameChange: (modification: ComposedModificationMetadata, newName: string) => Promise<unknown>
): ColumnDef<ComposedModificationMetadata>[] => [
    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.DRAG_HANDLE.id,
        cell: DragHandleRenderer,
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
        header: SelectHeaderRenderer,
        cell: SelectCellRenderer,
        size: 32,
        minSize: 32,
        meta: {
            cellStyle: networkModificationTableStyles.columnCell.select,
        },
    },
    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.NAME.id,
        header: NameHeaderRenderer,
        cell: NameCellRenderer,
        meta: {
            cellStyle: networkModificationTableStyles.columnCell.modificationName,
            onChange: onNameChange,
        },
        minSize: 160,
    },
    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.SHARED.id,
        cell: ReferenceCellRenderer,
        size: 48,
        minSize: 48,
        meta: {
            cellStyle: {
                paddingRight: '5px',
            },
        },
    },
    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.DESCRIPTION.id,
        cell: DescriptionCellRenderer,
        size: 40,
        minSize: 32,
    },

    {
        id: BASE_MODIFICATION_TABLE_COLUMNS.SWITCH.id,
        cell: SwitchCellRenderer,
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
    rootNetworks: RootNetworkMetadata[]
): ColumnDef<ComposedModificationMetadata>[] => {
    const tagMinSizes = rootNetworks.map((rootNetwork) => computeTagMinSize(rootNetwork.tag ?? ''));
    const sharedSize = Math.max(Math.min(...tagMinSizes), 56);

    return rootNetworks.map((rootNetwork, index) => ({
        id: rootNetwork.rootNetworkUuid,
        header: RootNetworkHeaderRenderer,
        cell: RootNetworkCellRenderer,
        size: sharedSize,
        minSize: tagMinSizes[index],
        meta: {
            cellStyle: networkModificationTableStyles.columnCell.rootNetworkChip,
        },
    }));
};
