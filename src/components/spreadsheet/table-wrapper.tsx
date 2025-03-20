/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { EquipmentTabs } from './equipment-tabs';
import { AppState } from '../../redux/reducer';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { UUID } from 'crypto';
import { Table } from './table';

type Equipment = {
    id: string;
    type: SpreadsheetEquipmentType;
    changed: boolean; // force to re-trigger render even if we click again on the same equipment
};

interface TableWrapperProps {
    disabled: boolean;
    tableEquipment?: Equipment;
}

export const TableWrapper: FunctionComponent<TableWrapperProps> = ({ tableEquipment, disabled }) => {
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const [activeTabUuid, setActiveTabUuid] = useState<UUID>(tablesDefinitions[0].uuid);
    const [localEquipment, setLocalEquipment] = useState<Equipment>();

    useEffect(() => {
        if (tableEquipment) {
            const matchingTab = tablesDefinitions.find((def) => def.type === tableEquipment.type);
            if (matchingTab) {
                setLocalEquipment(tableEquipment);
                // Need to switch to the tab with this equipment type
                setActiveTabUuid(matchingTab.uuid);
            }
        }
    }, [tableEquipment, tablesDefinitions]);

    const handleSwitchTab = useCallback((tabUuid: UUID) => {
        setLocalEquipment(undefined);
        setActiveTabUuid(tabUuid);
    }, []);

    return (
        <>
            <EquipmentTabs disabled={disabled} selectedTabUuid={activeTabUuid} handleSwitchTab={handleSwitchTab} />
            <Table
                activeTabUuid={activeTabUuid}
                disabled={disabled}
                equipmentId={localEquipment?.id ?? null}
                equipmentType={localEquipment?.type ?? null}
            />
        </>
    );
};
