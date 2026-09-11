/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { BusBarSections, ConnectablePositionInfos } from '@gridsuite/commons-ui';

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
