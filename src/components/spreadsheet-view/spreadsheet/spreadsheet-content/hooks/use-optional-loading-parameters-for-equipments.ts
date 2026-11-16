/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSpreadsheetOptionalLoadingParameters } from '../../../hooks/use-spreadsheet-optional-loading-parameters';
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
    [SpreadsheetEquipmentType.BOUNDARY_LINE]: false,
    [SpreadsheetEquipmentType.BUSBAR_SECTION]: false,
};

export function useOptionalLoadingParametersForEquipments() {
    const {
        remoteBranchOlg,
        remoteLineOlg,
        remoteLineBus,
        remoteTwtOlg,
        remoteGeneratorRegTerm,
        remoteGeneratorBus,
        remoteBatteryRegTerm,
        remoteBusNetworkComponents,
    } = useSpreadsheetOptionalLoadingParameters();
    const [branchOlg, setBranchOlg] = useState<boolean>(remoteBranchOlg);
    const [lineOlg, setLineOlg] = useState<boolean>(remoteLineOlg);
    const [lineBus, setLineBus] = useState<boolean>(remoteLineBus);
    const [twtOlg, setTwtOlg] = useState<boolean>(remoteTwtOlg);
    const [generatorRegTerm, setGeneratorRegTerm] = useState<boolean>(remoteGeneratorRegTerm);
    const [generatorBus, setGeneratorBus] = useState<boolean>(remoteGeneratorBus);
    const [batteryRegTerm, setBatteryRegTerm] = useState<boolean>(remoteBatteryRegTerm);
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
        const updateOptional = (type: SpreadsheetEquipmentType, previous: boolean, current: boolean) => {
            if (previous === current) {
                return;
            }
            const setOptional = current ? setLoadOptional : setCleanOptional;
            setOptional((prevState) => ({ ...prevState, [type]: true }));
        };

        updateOptional(SpreadsheetEquipmentType.BRANCH, branchOlg, remoteBranchOlg);
        updateOptional(SpreadsheetEquipmentType.LINE, lineOlg, remoteLineOlg);
        updateOptional(SpreadsheetEquipmentType.LINE, lineBus, remoteLineBus);
        updateOptional(SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER, twtOlg, remoteTwtOlg);
        updateOptional(SpreadsheetEquipmentType.GENERATOR, generatorRegTerm, remoteGeneratorRegTerm);
        updateOptional(SpreadsheetEquipmentType.GENERATOR, generatorBus, remoteGeneratorBus);
        updateOptional(SpreadsheetEquipmentType.BATTERY, batteryRegTerm, remoteBatteryRegTerm);
        updateOptional(SpreadsheetEquipmentType.BUS, busNetworkComponents, remoteBusNetworkComponents);
        setBranchOlg(remoteBranchOlg);
        setLineOlg(remoteLineOlg);
        setLineBus(remoteLineBus);
        setTwtOlg(remoteTwtOlg);
        setGeneratorRegTerm(remoteGeneratorRegTerm);
        setGeneratorBus(remoteGeneratorBus);
        setBatteryRegTerm(remoteBatteryRegTerm);
        setBusNetworkComponents(remoteBusNetworkComponents);
    }, [
        batteryRegTerm,
        branchOlg,
        busNetworkComponents,
        generatorRegTerm,
        generatorBus,
        lineOlg,
        lineBus,
        remoteBatteryRegTerm,
        remoteBranchOlg,
        remoteBusNetworkComponents,
        remoteGeneratorRegTerm,
        remoteGeneratorBus,
        remoteLineOlg,
        remoteLineBus,
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
