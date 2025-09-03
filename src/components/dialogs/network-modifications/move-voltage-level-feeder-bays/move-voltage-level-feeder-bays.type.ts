/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ConnectablePositionInfos } from '../../connectivity/connectivity.type';

export type FeederBayInfos = {
    busbarId: string;
    connectablePositionInfos: ConnectablePositionInfos;
};

export type FeederBaysInfos = FeederBayInfos & {
    voltageLevelId: string;
};
