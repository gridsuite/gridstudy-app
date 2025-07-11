/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { Svg } from './diagram-common';
import { ElementType } from '@gridsuite/commons-ui';

export enum DiagramType {
    VOLTAGE_LEVEL = 'voltage-level',
    SUBSTATION = 'substation',
    NETWORK_AREA_DIAGRAM = 'network-area-diagram',
    NAD_FROM_ELEMENT = 'nad-from-element',
}

export type NAD = DiagramType.NETWORK_AREA_DIAGRAM | DiagramType.NAD_FROM_ELEMENT;

export function isNadType(type: DiagramType): type is NAD {
    return type === DiagramType.NETWORK_AREA_DIAGRAM || type === DiagramType.NAD_FROM_ELEMENT;
}

export type SLD = DiagramType.VOLTAGE_LEVEL | DiagramType.SUBSTATION;

export function isSldType(type: DiagramType): type is SLD {
    return type === DiagramType.VOLTAGE_LEVEL || type === DiagramType.SUBSTATION;
}

// Create diagram parameters
type DiagramBaseParams = {
    diagramUuid: UUID;
    type: DiagramType;
};

type VoltageLevelDiagramParams = DiagramBaseParams & {
    type: DiagramType.VOLTAGE_LEVEL;
    voltageLevelId: string;
};
type SubstationDiagramParams = DiagramBaseParams & {
    type: DiagramType.SUBSTATION;
    substationId: string;
};
type NetworkAreaDiagramParams = DiagramBaseParams & {
    type: DiagramType.NETWORK_AREA_DIAGRAM;
    voltageLevelIds: string[];
    depth: number;
};
type NetworkAreaDiagramFromElementParams = DiagramBaseParams & {
    type: DiagramType.NAD_FROM_ELEMENT;
    elementUuid: UUID;
    elementType: ElementType;
    elementName: string;
};

export type DiagramParams =
    | VoltageLevelDiagramParams
    | SubstationDiagramParams
    | NetworkAreaDiagramParams
    | NetworkAreaDiagramFromElementParams;

// diagrams model
export type DiagramBase = {
    diagramUuid: UUID;
    type: DiagramType;
    name: string;
    svg: Svg | null;
};

export type VoltageLevelDiagram = DiagramBase & {
    type: DiagramType.VOLTAGE_LEVEL;
    voltageLevelId: string;
};
export type SubstationDiagram = DiagramBase & {
    type: DiagramType.SUBSTATION;
    substationId: string;
};
export type NetworkAreaDiagram = DiagramBase & {
    type: DiagramType.NETWORK_AREA_DIAGRAM;
    voltageLevelIds: string[];
    depth: number;
};
export type NetworkAreaDiagramFromElement = DiagramBase & {
    type: DiagramType.NAD_FROM_ELEMENT;
    elementUuid: UUID;
    elementType: ElementType;
    elementName: string;
};

export type Diagram = VoltageLevelDiagram | SubstationDiagram | NetworkAreaDiagram | NetworkAreaDiagramFromElement;
