/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum EnergySource {
    HYDRO = 'HYDRO',
    NUCLEAR = 'NUCLEAR',
    WIND = 'WIND',
    THERMAL = 'THERMAL',
    SOLAR = 'SOLAR',
    OTHER = 'OTHER',
}

interface EquipmentsContainer {
    containerId: string;
    containerName: string;
}

interface NonEvacuatedEnergyGeneratorCappingsByType {
    generators?: EquipmentsContainer[];
    energySource: EnergySource;
    activated: boolean;
}

interface NonEvacuatedEnergyStageDefinition {
    generators?: EquipmentsContainer[];
    energySource: EnergySource;
    pMaxPercents?: (number | undefined)[];
}

interface NonEvacuatedEnergyStagesSelection {
    name: string;
    stagesDefinitionIndex?: (number | undefined)[];
    pMaxPercentsIndex?: (number | undefined)[];
    activated: boolean;
}

interface NonEvacuatedEnergyGeneratorsCappings {
    sensitivityThreshold: number;
    generators?: NonEvacuatedEnergyGeneratorCappingsByType[];
}

interface NonEvacuatedEnergyMonitoredBranches {
    branches: EquipmentsContainer[];
    activated: boolean;
    istN: boolean;
    limitNameN?: string | null;
    nCoefficient: number;
    istNm1: boolean;
    limitNameNm1?: string | null;
    nm1Coefficient: number;
}

interface NonEvacuatedEnergyContingencies {
    contingencies: EquipmentsContainer[];
    activated: boolean;
}

export interface NonEvacuatedEnergyParametersInfos {
    stagesDefinition?: NonEvacuatedEnergyStageDefinition[];
    stagesSelection?: NonEvacuatedEnergyStagesSelection[];
    generatorsCappings?: NonEvacuatedEnergyGeneratorsCappings;
    monitoredBranches?: NonEvacuatedEnergyMonitoredBranches[];
    contingencies?: NonEvacuatedEnergyContingencies[];
}
