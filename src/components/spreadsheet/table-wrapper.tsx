/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Grid } from '@mui/material';
import { EquipmentTabs } from './equipment-tabs';
import { AppState } from '../../redux/reducer';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { UUID } from 'crypto';
import { Table } from './table';

interface TableWrapperProps {
    equipmentId: string;
    equipmentType: SpreadsheetEquipmentType;
    equipmentChanged: boolean;
    disabled: boolean;
    onEquipmentScrolled: () => void;
}

export const TableWrapper: FunctionComponent<TableWrapperProps> = ({
    equipmentId,
    equipmentType,
    equipmentChanged,
    disabled,
    onEquipmentScrolled,
}) => {
    const [activeTabUuid, setActiveTabUuid] = useState<UUID | null>(null);
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const [manualTabSwitch, setManualTabSwitch] = useState<boolean>(true);

    // Initialize activeTabUuid with the first tab's UUID if not already set
    useEffect(() => {
        if (!activeTabUuid && tablesDefinitions.length > 0) {
            setActiveTabUuid(tablesDefinitions[0].uuid);
        }
    }, [activeTabUuid, tablesDefinitions]);

    const handleSwitchTab = useCallback((tabUuid: UUID) => {
        setManualTabSwitch(true);
        setActiveTabUuid(tabUuid);
    }, []);

    useEffect(() => {
        setManualTabSwitch(false);
    }, [equipmentChanged]);

    // Initialize activeTabUuid with the first tab's UUID if not already set
    useEffect(() => {
        if (!activeTabUuid && tablesDefinitions.length > 0) {
            setActiveTabUuid(tablesDefinitions[0].uuid);
        }
    }, [activeTabUuid, tablesDefinitions]);

    useEffect(() => {
        if (equipmentId !== null && equipmentType !== null && !manualTabSwitch) {
            const matchingTab = tablesDefinitions.find((def) => def.type === equipmentType);
            if (matchingTab) {
                if (matchingTab.uuid !== activeTabUuid) {
                    // Need to switch to the tab with this equipment type
                    setActiveTabUuid(matchingTab.uuid);
                }
            }
        }
    }, [equipmentId, equipmentType, equipmentChanged, manualTabSwitch, activeTabUuid, tablesDefinitions]);

    return (
        <>
            <EquipmentTabs disabled={disabled} selectedTabUuid={activeTabUuid} handleSwitchTab={handleSwitchTab} />
            <Table
                activeTabUuid={activeTabUuid}
                manualTabSwitch={manualTabSwitch}
                disabled={disabled}
                equipmentId={equipmentId}
                equipmentType={equipmentType}
                onEquipmentScrolled={onEquipmentScrolled}
            />
        </>
    );
};
