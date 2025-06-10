/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import RunningStatus from 'components/utils/running-status';
import { AppState } from 'redux/reducer';

const loadflowWithRatioTapChangersStatus = (state: AppState) => state.computingStatus.LOAD_FLOW_WITH_RATIO_TAP_CHANGERS;
const loadflowWithoutRatioTapChangersStatus = (state: AppState) =>
    state.computingStatus.LOAD_FLOW_WITHOUT_RATIO_TAP_CHANGERS;

// loadflow is divided into 2 separates status : execute with of without ratio tap changers
// to keep things simple, this selector combine those two status into one
// only one of those status can be different from IDLE, we return the one that is not IDLE when possible
export const selectLoadflowComputingStatus = createSelector(
    [loadflowWithRatioTapChangersStatus, loadflowWithoutRatioTapChangersStatus],
    (lfWithTapChangersStatus, lfWithoutTapChangersStatus) =>
        lfWithTapChangersStatus !== RunningStatus.IDLE ? lfWithTapChangersStatus : lfWithoutTapChangersStatus
);
