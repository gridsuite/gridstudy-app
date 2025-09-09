/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ConnectablePositionFormInfos } from 'components/dialogs/connectivity/connectivity.type';
import { MeasurementInfo } from '../../common/measurements/measurement.type';

export interface LoadFormInfos {
    id: string;
    name: string;
    type: string;
    p0: number;
    q0: number;
    voltageLevelId: string;
    connectablePosition: ConnectablePositionFormInfos;
    busOrBusbarSectionId: string;
    terminalConnected?: boolean | null;
    measurementP: MeasurementInfo | undefined;
    measurementQ: MeasurementInfo | undefined;
    properties: Record<string, string> | undefined;
}
