/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type DiagramParamsWithoutId, type DiagramParams } from '../cards/diagrams/diagram.type';

export type CreateDiagramFuncType<Type extends DiagramParams> = (diagramParams: DiagramParamsWithoutId<Type>) => void;
export type UpdateDiagramFuncType = (diagramParams: DiagramParams, fetch?: boolean) => void;
