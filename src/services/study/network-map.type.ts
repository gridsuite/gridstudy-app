/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { LimitsProperty } from '../network-modification-types';
import { Equipment } from '../../components/dialogs/network-modifications/common/properties/property-utils';
import { BusBarSections } from '../../components/dialogs/network-modifications/voltage-level/section/voltage-level-section.type';
import { ConnectablePositionInfos } from '../../components/dialogs/connectivity/connectivity.type';

export type SwitchInfos = {
    id: string;
    open: boolean;
};

export type BusBarSectionsInfos = {
    topologyKind: string;
    busbarCount: number;
    sectionCount: number;
    isSymmetrical: boolean;
    isBusbarSectionPositionFound: boolean;
    busBarSections: BusBarSections;
};

interface FeederBay {
    busbarSectionId: string;
    connectionSide: string | null;
    connectablePositionInfos: ConnectablePositionInfos;
}

export type FeederBaysInfos = Record<string, FeederBay[]>;

export type BranchInfos = Equipment & {
    name: string;
    voltageLevelId1: string;
    voltageLevelId2: string;
    busOrBusbarSectionId1: string;
    busOrBusbarSectionId2: string;
    currentLimits: CurrentLimitsData[];
    selectedOperationalLimitsGroup1: string;
    selectedOperationalLimitsGroup2: string;
};

export interface CurrentLimitsData {
    id: string;
    applicability?: string;
    limitsProperties?: LimitsProperty[];
    permanentLimit: number | null;
    temporaryLimits: TemporaryLimitsData[];
}

export interface TemporaryLimitsData {
    name: string;
    value: number | null;
    acceptableDuration: number | null;
    modificationType?: string;
}
