/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import type { AppState } from '../../../redux/reducer.type';
import { SpreadsheetEquipmentType } from '../types/spreadsheet.type';

export function useSpreadsheetOptionalLoadingParameters() {
    const remoteBranchOlg = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.BRANCH].operationalLimitsGroups
    );
    const remoteLineOlg = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.LINE].operationalLimitsGroups
    );
    const remoteLineBus = useSelector(
        (state: AppState) => state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.LINE].bus
    );
    const remoteTwtOlg = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]
                .operationalLimitsGroups
    );
    const remoteGeneratorRegTerm = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.GENERATOR].regulatingTerminal
    );
    const remoteGeneratorBus = useSelector(
        (state: AppState) => state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.GENERATOR].bus
    );
    const remoteBatteryRegTerm = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.BATTERY].regulatingTerminal
    );
    const remoteBusNetworkComponents = useSelector(
        (state: AppState) => state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.BUS].networkComponents
    );

    return {
        remoteBranchOlg,
        remoteLineOlg,
        remoteLineBus,
        remoteTwtOlg,
        remoteGeneratorRegTerm,
        remoteGeneratorBus,
        remoteBatteryRegTerm,
        remoteBusNetworkComponents,
    };
}
