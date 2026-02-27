/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import type { AppState } from '../../../../../redux/reducer.type';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { useCallback, useEffect, useState } from 'react';

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
    [SpreadsheetEquipmentType.DANGLING_LINE]: false,
    [SpreadsheetEquipmentType.BUSBAR_SECTION]: false,
};

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
    const remoteBusNetworkComponents = useSelector(
        (state: AppState) => state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.BUS].networkComponents
    );
    const [branchOlg, setBranchOlg] = useState<boolean>(remoteBranchOlg);
    const [lineOlg, setLineOlg] = useState<boolean>(remoteLineOlg);
    const [twtOlg, setTwtOlg] = useState<boolean>(remoteTwtOlg);
    const [generatorRegTerm, setGeneratorRegTerm] = useState<boolean>(remoteGeneratorRegTerm);
    const [busNetworkComponents, setBusNetworkComponents] = useState<boolean>(remoteBusNetworkComponents);

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
        if (remoteBranchOlg !== branchOlg && remoteBranchOlg) {
            setLoadOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.BRANCH]: true };
            });
        } else if (remoteBranchOlg !== branchOlg && !remoteBranchOlg) {
            setCleanOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.BRANCH]: true };
            });
        } else if (remoteLineOlg !== lineOlg && remoteLineOlg) {
            setLoadOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.LINE]: true };
            });
        } else if (remoteLineOlg !== lineOlg && !remoteLineOlg) {
            setCleanOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.LINE]: true };
            });
        } else if (remoteTwtOlg !== twtOlg && remoteTwtOlg) {
            setLoadOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]: true };
            });
        } else if (remoteTwtOlg !== twtOlg && !remoteTwtOlg) {
            setCleanOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]: true };
            });
        } else if (remoteGeneratorRegTerm !== generatorRegTerm && remoteGeneratorRegTerm) {
            setLoadOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.GENERATOR]: true };
            });
        } else if (remoteGeneratorRegTerm !== generatorRegTerm && !remoteGeneratorRegTerm) {
            setCleanOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.GENERATOR]: true };
            });
        } else if (remoteBusNetworkComponents !== busNetworkComponents && remoteBusNetworkComponents) {
            setLoadOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.BUS]: true };
            });
        } else if (remoteBusNetworkComponents !== busNetworkComponents && !remoteBusNetworkComponents) {
            setCleanOptional((prevState) => {
                return { ...prevState, [SpreadsheetEquipmentType.BUS]: true };
            });
        }
        setBranchOlg(remoteBranchOlg);
        setLineOlg(remoteLineOlg);
        setTwtOlg(remoteTwtOlg);
        setGeneratorRegTerm(remoteGeneratorRegTerm);
        setBusNetworkComponents(remoteBusNetworkComponents);
    }, [
        branchOlg,
        busNetworkComponents,
        generatorRegTerm,
        lineOlg,
        remoteBranchOlg,
        remoteBusNetworkComponents,
        remoteGeneratorRegTerm,
        remoteLineOlg,
        remoteTwtOlg,
        twtOlg,
    ]);

    return {
        loadOptional,
        equipmentsWithLoadingOptionsLoaded,
        cleanOptional,
        equipmentsWithLoadingOptionsCleaned,
    };
}
