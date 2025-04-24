/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EquipmentModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { TopologyVoltageLevelModificationInfos } from '../../../../services/network-modification-types';
import { CURRENT_CONNECTION_STATUS, PREV_CONNECTION_STATUS, SWITCH_ID } from '../../../utils/field-constants';
import { CustomHeaderProps } from 'ag-grid-react';
import React, { ComponentType } from 'react';

export type SwitchInfos = {
    id: string;
    open: boolean;
};

export type VoltageLevelTopologyModificationDialogProps = EquipmentModificationDialogProps & {
    editData: TopologyVoltageLevelModificationInfos;
};

export interface SwitchRowData {
    [SWITCH_ID]: string;
    [PREV_CONNECTION_STATUS]: string;
    [CURRENT_CONNECTION_STATUS]: boolean | null;
    isModified?: boolean;
    isSeparator?: boolean;
}

export interface CellStyleParams {
    data: SwitchRowData;
}

export interface CellRendererParams {
    data: SwitchRowData;
    value: any;
}

export interface ColumnDef<T = CustomHeaderProps> {
    field: string;
    filter?: boolean;
    flex?: number;
    cellStyle?: (params: CellStyleParams) => Record<string, string>;
    headerComponent?: ComponentType<T>;
    headerComponentParams?: {
        displayName: string;
        isNodeBuilt: boolean;
    };
    cellRenderer?: (params: CellRendererParams) => React.ReactNode;
    editable?: boolean;
}

export const styles = {
    grid: {
        marginTop: 2,
    },
};
