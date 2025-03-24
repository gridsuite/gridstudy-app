/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { Box } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { EquipmentTable } from './equipment-table';
import { Identifiable } from '@gridsuite/commons-ui';
import { useCustomColumn } from './custom-columns/use-custom-column';
import { AppState } from '../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { UUID } from 'crypto';
import { useFetchEquipment } from './data-fetching/use-fetch-equipment';

const styles = {
    table: (theme: Theme) => ({
        marginTop: theme.spacing(2.5),
        lineHeight: 'unset',
        flexGrow: 1,
    }),
    blink: {
        animation: '$blink 2s infinite',
    },
    '@keyframes blink': {
        '0%': {
            opacity: 1,
        },
        '50%': {
            opacity: 0.1,
        },
    },
    toolbar: (theme: Theme) => ({
        marginTop: theme.spacing(2),
        alignItems: 'center',
    }),
    selectColumns: (theme: Theme) => ({
        marginLeft: theme.spacing(1),
    }),
    save: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

interface TableWrapperProps {
    activeTabUuid: UUID;
    equipmentId: string | null;
    equipmentType: SpreadsheetEquipmentType | null;
}

interface RecursiveIdentifiable extends Identifiable {
    [alias: string]: Identifiable | string | undefined;
}

export const TableWrapper: FunctionComponent<TableWrapperProps> = ({ activeTabUuid, equipmentId, equipmentType }) => {
    const gridRef = useRef<AgGridReact>(null);

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeId = useSelector((state: AppState) => state.currentTreeNode?.id);
    const type = useSelector((state: AppState) =>
        activeTabUuid ? state.tables.static[activeTabUuid].type : undefined
    );
    const columnsDefinitions = useCustomColumn(activeTabUuid);
    //const [rowData, setRowData] = useState<Identifiable[]>();

    const { fetchNodesEquipmentData } = useFetchEquipment(type);

    useEffect(() => {
        gridRef.current?.api?.setGridOption('columnDefs', columnsDefinitions);
        let localRowData: Identifiable[] = [];
        if (currentNodeId && fetchNodesEquipmentData) {
            fetchNodesEquipmentData(new Set([currentNodeId]))?.then((eq) => {
                eq?.equipmentsByNodeId[currentNodeId]?.forEach((equipment) => {
                    let equipmentToAdd: RecursiveIdentifiable = { ...equipment };
                    localRowData.push(equipmentToAdd);
                });
                gridRef.current?.api?.setGridOption('rowData', localRowData);
                //setRowData(localRowData);
            });
        }
    }, [columnsDefinitions, currentNodeId, fetchNodesEquipmentData]);

    useEffect(() => {
        if (equipmentId !== null && equipmentType !== null) {
            //calculate row index to scroll to
            //since all sorting and filtering is done by aggrid, we need to use their APIs to get the actual index
            const selectedRow = gridRef.current?.api?.getRowNode(equipmentId);
            if (selectedRow) {
                gridRef.current?.api?.ensureNodeVisible(selectedRow, 'top');
                selectedRow.setSelected(true, true);
            }
        }
    }, [equipmentId, equipmentType]);

    console.log('render');

    return (
        <>
            <Box sx={styles.table}>
                <EquipmentTable
                    studyUuid={studyUuid!}
                    currentNode={currentNodeId!}
                    gridRef={gridRef}
                    rowData={[]}
                    columnData={[]}
                />
            </Box>
        </>
    );
};
