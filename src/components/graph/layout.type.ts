/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CurrentTreeNode } from './tree-node.type';

export type NodePlacement = {
    row: number;
    column: number;
};

export type NodeMap = Map<string, { index: number; node: CurrentTreeNode; belongsToSecurityGroupId: string | null }>;

export type SecurityGroupMembersMap = Map<string, string[]>;
