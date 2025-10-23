/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { DiagramConfigPosition } from '../../../../services/explore';
import { DiagramMetadata, SLDMetadata } from '@powsybl/network-viewer';

export enum DiagramType {
    VOLTAGE_LEVEL = 'voltage-level',
    SUBSTATION = 'substation',
    NETWORK_AREA_DIAGRAM = 'network-area-diagram',
}

// type helper to transform required property into optional one
type WithOptionalProperty<Type, Key extends keyof Type> = Omit<Type, Key> & Partial<Pick<Type, Key>>;

// Create diagram parameters
type DiagramBaseParams = {
    diagramUuid: UUID;
    type: DiagramType;
    name: string;
};

export type VoltageLevelDiagramParams = DiagramBaseParams & {
    type: DiagramType.VOLTAGE_LEVEL;
    voltageLevelId: string;
};
export type SubstationDiagramParams = DiagramBaseParams & {
    type: DiagramType.SUBSTATION;
    substationId: string;
};
export type NetworkAreaDiagramParams = DiagramBaseParams & {
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
export type DiagramParamsWithoutId<Type extends DiagramParams> = WithOptionalProperty<Type, 'diagramUuid'>;
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

// diagram Svg & metadata
export interface SldAdditionalMetadata {
    id: string;
    country: string;
    substationId?: string;
}

export interface SldSvg {
    svg: string | null;
    metadata: SLDMetadata | null;
    additionalMetadata: SldAdditionalMetadata | null;
    error?: string | null;
    svgUrl?: string | null;
}

export interface VoltageLevel {
    id?: string;
    substationId: UUID;
    country?: string;
    name?: string;
}

export interface DiagramAdditionalMetadata {
    nbVoltageLevels: number;
    scalingFactor: number;
    voltageLevels: VoltageLevel[];
}

export interface DiagramSvg {
    svg: string | null;
    metadata: DiagramMetadata | null;
    additionalMetadata: DiagramAdditionalMetadata | null;
    error?: string | null;
    svgUrl?: string | null;
}

export type Svg = DiagramSvg | SldSvg;

export const NETWORK_AREA_DIAGRAM_DETAILS_TYPE = 'network-area-diagram-details' as const;
type NetworkAreaDiagramDto = Omit<
    NetworkAreaDiagramParams,
    'nadConfigUuid' | 'initializationNadConfigUuid' | 'voltageLevelToExpandIds' | 'voltageLevelToOmitIds'
> & {
    originalNadConfigUuid?: UUID;
    currentNadConfigUuid?: UUID;
};

export type DiagramParamsDto = VoltageLevelDiagramParams | SubstationDiagramParams | NetworkAreaDiagramDto;
