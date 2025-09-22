/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ConnectablePositionInfos } from '../../../connectivity/connectivity.type';

export type FeederBaysFormInfos = {
    equipmentId: string | null;
    busbarSectionId: string | null;
    connectionSide: string | null;
    connectionName: string | null;
    connectionDirection: string | null;
    connectionPosition: string | null;
    isSeparator: boolean;
    isRemoved: boolean;
};

export type FeederBayInfos = {
    busbarSectionId: string;
    connectionSide: string | null;
    connectablePositionInfos: ConnectablePositionInfos;
};

export type FeederBaysInfos = (FeederBayInfos & {
    equipmentId: string;
})[];
