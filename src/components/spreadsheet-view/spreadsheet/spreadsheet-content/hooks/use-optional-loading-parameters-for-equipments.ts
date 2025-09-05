/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import type { AppState } from '../../../../../redux/reducer';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { useEffect, useState } from 'react';
import { useStateBoolean } from '@gridsuite/commons-ui';

export function useOptionalLoadingParametersForEquipments(type: SpreadsheetEquipmentType) {
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
    const [branchOlg, setBranchOlg] = useState<boolean>(remoteBranchOlg);
    const [lineOlg, setLineOlg] = useState<boolean>(remoteLineOlg);
    const [twtOlg, setTwtOlg] = useState<boolean>(remoteTwtOlg);
    const [generatorRegTerm, setGeneratorRegTerm] = useState<boolean>(remoteGeneratorRegTerm);
    const {
        value: shouldLoadOptionalLoadingParameters,
        setValue: setShouldLoadOptionalLoadingParameters,
        setFalse: equipmentsWithLoadingOptionsLoaded,
    } = useStateBoolean(false);
    const {
        value: shouldCleanOptionalLoadingParameters,
        setValue: setShouldCleanOptionalLoadingParameters,
        setFalse: equipmentsWithLoadingOptionsCleaned,
    } = useStateBoolean(false);

    useEffect(() => {
        if (type === SpreadsheetEquipmentType.BRANCH && remoteBranchOlg !== branchOlg && remoteBranchOlg) {
            setShouldLoadOptionalLoadingParameters(true);
        } else if (type === SpreadsheetEquipmentType.BRANCH && remoteBranchOlg !== branchOlg && !remoteBranchOlg) {
            setShouldCleanOptionalLoadingParameters(true);
        } else if (type === SpreadsheetEquipmentType.LINE && remoteLineOlg !== lineOlg && remoteLineOlg) {
            setShouldLoadOptionalLoadingParameters(true);
        } else if (type === SpreadsheetEquipmentType.LINE && remoteLineOlg !== lineOlg && !remoteLineOlg) {
            setShouldCleanOptionalLoadingParameters(true);
        } else if (
            type === SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER &&
            remoteTwtOlg !== twtOlg &&
            remoteTwtOlg
        ) {
            setShouldLoadOptionalLoadingParameters(true);
        } else if (
            type === SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER &&
            remoteTwtOlg !== twtOlg &&
            !remoteTwtOlg
        ) {
            setShouldCleanOptionalLoadingParameters(true);
        } else if (
            type === SpreadsheetEquipmentType.GENERATOR &&
            remoteGeneratorRegTerm !== generatorRegTerm &&
            remoteGeneratorRegTerm
        ) {
            setShouldLoadOptionalLoadingParameters(true);
        } else if (
            type === SpreadsheetEquipmentType.GENERATOR &&
            remoteGeneratorRegTerm !== generatorRegTerm &&
            !remoteGeneratorRegTerm
        ) {
            setShouldCleanOptionalLoadingParameters(true);
        }
        setBranchOlg(remoteBranchOlg);
        setLineOlg(remoteLineOlg);
        setTwtOlg(remoteTwtOlg);
        setGeneratorRegTerm(remoteGeneratorRegTerm);
    }, [
        branchOlg,
        generatorRegTerm,
        lineOlg,
        remoteBranchOlg,
        remoteGeneratorRegTerm,
        remoteLineOlg,
        remoteTwtOlg,
        setShouldCleanOptionalLoadingParameters,
        setShouldLoadOptionalLoadingParameters,
        twtOlg,
        type,
    ]);

    return {
        shouldLoadOptionalLoadingParameters,
        equipmentsWithLoadingOptionsLoaded,
        shouldCleanOptionalLoadingParameters,
        equipmentsWithLoadingOptionsCleaned,
    };
}
