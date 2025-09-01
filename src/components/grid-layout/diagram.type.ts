/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { Svg } from './diagram-common';
import { DiagramConfigPosition } from '../../services/explore';

export enum DiagramType {
    VOLTAGE_LEVEL = 'voltage-level',
    SUBSTATION = 'substation',
    NETWORK_AREA_DIAGRAM = 'network-area-diagram',
}

// Create diagram parameters
type DiagramBaseParams = {
    diagramUuid: UUID;
    type: DiagramType;
    name: string;
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
    nadConfigUuid: UUID | undefined;
    initializationNadConfigUuid?: UUID; // used for initialization, not saved
    filterUuid: UUID | undefined;
    voltageLevelIds: string[];
    voltageLevelToExpandIds: string[];
    voltageLevelToOmitIds: string[];
    positions: DiagramConfigPosition[];
};

export type DiagramParams = VoltageLevelDiagramParams | SubstationDiagramParams | NetworkAreaDiagramParams;

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
    nadConfigUuid: UUID | undefined;
    initializationNadConfigUuid?: UUID; // used for initialization, not saved
    filterUuid: UUID | undefined;
    voltageLevelIds: string[];
    voltageLevelToExpandIds: string[];
    voltageLevelToOmitIds: string[];
    positions: DiagramConfigPosition[];
};

export type Diagram = VoltageLevelDiagram | SubstationDiagram | NetworkAreaDiagram;

export const NETWORK_AREA_DIAGRAM_DETAILS_TYPE = 'network-area-diagram-details' as const;
type NetworkAreaDiagramDto = Omit<
    NetworkAreaDiagramParams,
    'nadConfigUuid' | 'initializationNadConfigUuid' | 'voltageLevelToExpandIds' | 'voltageLevelToOmitIds'
> & {
    originalNadConfigUuid?: UUID;
    currentNadConfigUuid?: UUID;
};

export type DiagramParamsDto = VoltageLevelDiagramParams | SubstationDiagramParams | NetworkAreaDiagramDto;
