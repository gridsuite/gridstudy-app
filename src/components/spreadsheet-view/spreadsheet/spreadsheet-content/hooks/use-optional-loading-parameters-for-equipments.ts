/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import type { AppState } from '../../../../../redux/reducer.type';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { useCallback, useEffect, useRef, useState } from 'react';

type OptionalLoadingParameters = Record<SpreadsheetEquipmentType, boolean>;

const initialOptionalLoadingParameters: Record<SpreadsheetEquipmentType, boolean> = {
    [SpreadsheetEquipmentType.BRANCH]: false,
    [SpreadsheetEquipmentType.LINE]: false,
    [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]: false,
    [SpreadsheetEquipmentType.GENERATOR]: false,
    [SpreadsheetEquipmentType.BUS]: false,
    [SpreadsheetEquipmentType.SUBSTATION]: false,
    [SpreadsheetEquipmentType.VOLTAGE_LEVEL]: false,
    [SpreadsheetEquipmentType.THREE_WINDINGS_TRANSFORMER]: false,
    [SpreadsheetEquipmentType.LOAD]: false,
    [SpreadsheetEquipmentType.SHUNT_COMPENSATOR]: false,
    [SpreadsheetEquipmentType.STATIC_VAR_COMPENSATOR]: false,
    [SpreadsheetEquipmentType.BATTERY]: false,
    [SpreadsheetEquipmentType.HVDC_LINE]: false,
    [SpreadsheetEquipmentType.LCC_CONVERTER_STATION]: false,
    [SpreadsheetEquipmentType.VSC_CONVERTER_STATION]: false,
    [SpreadsheetEquipmentType.TIE_LINE]: false,
    [SpreadsheetEquipmentType.BOUNDARY_LINE]: false,
    [SpreadsheetEquipmentType.BUSBAR_SECTION]: false,
};

const TRACKED_TYPES = [
    SpreadsheetEquipmentType.BRANCH,
    SpreadsheetEquipmentType.LINE,
    SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER,
    SpreadsheetEquipmentType.GENERATOR,
    SpreadsheetEquipmentType.BATTERY,
    SpreadsheetEquipmentType.BUS,
] as const;

export function useOptionalLoadingParametersForEquipments() {
    const remoteBranchOlg = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.BRANCH].operationalLimitsGroups
    );
    const remoteLineOlg = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.LINE].operationalLimitsGroups
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
    const remoteBatteryRegTerm = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.BATTERY].regulatingTerminal
    );
    const remoteBusNetworkComponents = useSelector(
        (state: AppState) => state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.BUS].networkComponents
    );

    const previousValuesRef = useRef<boolean[]>([
        remoteBranchOlg,
        remoteLineOlg,
        remoteTwtOlg,
        remoteGeneratorRegTerm,
        remoteBatteryRegTerm,
        remoteBusNetworkComponents,
    ]);

    const [loadOptional, setLoadOptional] = useState<OptionalLoadingParameters>(initialOptionalLoadingParameters);
    const [cleanOptional, setCleanOptional] = useState<OptionalLoadingParameters>(initialOptionalLoadingParameters);

    const equipmentsWithLoadingOptionsLoaded = useCallback((type: SpreadsheetEquipmentType) => {
        setLoadOptional((prevState) => {
            return { ...prevState, [type]: false };
        });
    }, []);

    const equipmentsWithLoadingOptionsCleaned = useCallback((type: SpreadsheetEquipmentType) => {
        setCleanOptional((prevState) => {
            return { ...prevState, [type]: false };
        });
    }, []);

    useEffect(() => {
        const currentValues = [
            remoteBranchOlg,
            remoteLineOlg,
            remoteTwtOlg,
            remoteGeneratorRegTerm,
            remoteBatteryRegTerm,
            remoteBusNetworkComponents,
        ];
        const previousValues = previousValuesRef.current;

        const toLoad: SpreadsheetEquipmentType[] = [];
        const toClean: SpreadsheetEquipmentType[] = [];

        TRACKED_TYPES.forEach((type, index) => {
            const current = currentValues[index];
            if (current === previousValues[index]) {
                return;
            }
            if (current) {
                toLoad.push(type);
            } else {
                toClean.push(type);
            }
        });

        if (toLoad.length > 0) {
            setLoadOptional((prev) => {
                const next = { ...prev };
                toLoad.forEach((type) => {
                    next[type] = true;
                });
                return next;
            });
        }

        if (toClean.length > 0) {
            setCleanOptional((prev) => {
                const next = { ...prev };
                toClean.forEach((type) => {
                    next[type] = true;
                });
                return next;
            });
        }

        previousValuesRef.current = currentValues;
    }, [
        remoteBranchOlg,
        remoteLineOlg,
        remoteTwtOlg,
        remoteGeneratorRegTerm,
        remoteBatteryRegTerm,
        remoteBusNetworkComponents,
    ]);

    return {
        loadOptional,
        equipmentsWithLoadingOptionsLoaded,
        cleanOptional,
        equipmentsWithLoadingOptionsCleaned,
    };
}
