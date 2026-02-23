/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../tree-node.type';
import { FetchStatus } from '../../../../services/utils.type';
import { JSX } from 'react';

export interface RootNetworkMetadata {
    rootNetworkUuid: UUID;
    originalCaseUuid: UUID;
    name: string;
    tag: string;
    isCreating: boolean;
    description?: string;
}

export interface RootNetworkInfos {
    id?: UUID;
    name: string;
    tag: string;
    description?: string;
    caseInfos: CaseInfos;
    importParametersRaw: Record<string, any> | null;
}

export interface CaseInfos {
    originalCaseUuid: UUID | null;
    caseFormat: string | null;
}

export interface ExcludedNetworkModifications {
    rootNetworkUuid: UUID;
    modificationUuidsToExclude: UUID[];
}

export enum NetworkModificationCopyType {
    COPY = 'COPY',
    MOVE = 'MOVE',
    SPLIT_COMPOSITE = 'SPLIT_COMPOSITE',
    INSERT_COMPOSITE = 'INSERT_COMPOSITE',
}

export interface NetworkModificationCopyInfos {
    copyType: NetworkModificationCopyType;
    originStudyUuid?: UUID;
    originNodeUuid?: UUID;
}

export interface MenuDefinitionSubItem {
    id: string;
    label: string;
    hide?: boolean;
    action: () => JSX.Element;
}

interface MenuDefinitionBase {
    id: string;
    label: string;
    hide?: boolean;
}

export interface MenuDefinitionWithSubItem extends MenuDefinitionBase {
    subItems: MenuDefinitionSubItem[];
}

export interface MenuDefinitionWithoutSubItem extends MenuDefinitionBase {
    action?: () => JSX.Element;
}

export type MenuDefinition = MenuDefinitionWithSubItem | MenuDefinitionWithoutSubItem;

export interface NetworkModificationData {
    uuid: UUID;
    type: string;
    [key: string]: any;
}

export interface MenuSection {
    id: string;
    label?: string;
    items: MenuDefinition[];
}

// Cf withDefaultParams : common props for any modification available from the menu
export type NetworkModificationDialogProps = {
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus?: FetchStatus;
    onValidated?: () => void;
    onClose: () => void;
};

export type EquipmentModificationDialogProps = NetworkModificationDialogProps & {
    defaultIdValue: string;
};
