/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Node } from '@xyflow/react';
import { NodePlacement } from '../layout.type';

export const groupIdSuffix = '_labeled_group';
export const LABELED_GROUP_TYPE = 'GROUP_LABEL';

export type LabeledGroupNodeType = Node<{ position: { topLeft: NodePlacement; bottomRight: NodePlacement } }>;
