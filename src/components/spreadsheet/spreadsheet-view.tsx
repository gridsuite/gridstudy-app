/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { EquipmentTabs } from './equipment-tabs';
import { AppState } from '../../redux/reducer';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { UUID } from 'crypto';
import { TableWrapper } from './table-wrapper';
import { Alert } from '@mui/material';
import { FormattedMessage } from 'react-intl';

type Equipment = {
    id: string;
    type: SpreadsheetEquipmentType;
    changed: boolean; // force to re-trigger render even if we click again on the same equipment
};

interface SpreadsheetViewProps {
    disabled: boolean;
    tableEquipment?: Equipment;
}

const styles = {
    invalidNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
};

export const SpreadsheetView: FunctionComponent<SpreadsheetViewProps> = ({ tableEquipment, disabled }) => {
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const [activeTabUuid, setActiveTabUuid] = useState<UUID>(tablesDefinitions[0].uuid);
    const [localEquipment, setLocalEquipment] = useState<Equipment>();

    const isEmptyCollection = useMemo(() => disabled || tablesDefinitions.length === 0, [disabled, tablesDefinitions]);

    const handleSwitchTab = useCallback((tabUuid: UUID) => {
        setLocalEquipment(undefined);
        setActiveTabUuid(tabUuid);
    }, []);

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

    return (
        <>
            {disabled || isEmptyCollection ? (
                <Alert sx={styles.invalidNode} severity="warning">
                    <FormattedMessage id={disabled ? 'InvalidNode' : 'NoSpreadsheets'} />
                </Alert>
            ) : (
                <>
                    <EquipmentTabs selectedTabUuid={activeTabUuid} handleSwitchTab={handleSwitchTab} />
                    <TableWrapper
                        activeTabUuid={activeTabUuid}
                        equipmentId={localEquipment?.id ?? null}
                        equipmentType={localEquipment?.type ?? null}
                    />
                </>
            )}
        </>
    );
};
