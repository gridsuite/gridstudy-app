/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../tree-node.type';
import { FetchStatus } from '../../../../services/utils.type';
export interface RootNetworkMetadata {
    rootNetworkUuid: UUID;
    name: string;
    tag: string;
    isCreating: boolean;
}

export interface NetworkModificationMetadata {
    uuid: UUID;
    type: string;
    date: Date;
    stashed: boolean;
    activated: boolean;
    messageType: string;
    messageValues: string;
}

export interface NetworkModificationInfos {
    modificationInfos: NetworkModificationMetadata;
    activationStatusByRootNetwork: Record<UUID, boolean>;
}

export enum NetworkModificationCopyType {
    COPY = 'COPY',
    MOVE = 'MOVE',
    INSERT = 'INSERT',
}

export interface NetworkModificationCopyInfo {
    copyType: NetworkModificationCopyType;
    originNodeUuid?: UUID;
}

export interface MenuDefinitionSubItem {
    id: string;
    label: string;
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

// Cf withDefaultParams : common props for any modification available from the menu
export type DefaultNetworkModificationDialogProps = {
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus?: FetchStatus;
    onValidated?: () => void;
    onClose: () => void;
};

export type DefaultEquipmentModificationDialogProps = DefaultNetworkModificationDialogProps & {
    defaultIdValue: string;
};
