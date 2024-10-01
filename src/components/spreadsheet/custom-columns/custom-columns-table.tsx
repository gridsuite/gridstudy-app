/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import DndTable from 'components/utils/dnd-table/dnd-table';
import { COLUMN_NAME, FORMULA, TAB_CUSTOM_COLUMN } from './custom-columns-form';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import { IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export default function CustomColumnTable() {
    const DndTableTyped = DndTable as React.ComponentType<any>;
    const intl = useIntl();
    const CustomColumnTooltip = useMemo(() => {
        return (
            <Tooltip
                title={intl.formatMessage({
                    id: 'spreadsheet/custom_column/column_content_tooltip',
                })}
            >
                <IconButton>
                    <InfoIcon />
                </IconButton>
            </Tooltip>
        );
    }, [intl]);

    const CUSTOM_COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: 'spreadsheet/custom_column/column_name',
                dataKey: COLUMN_NAME,
                initialValue: null,
                editable: true,
                titleId: 'FiltersListsSelection',
                width: '30%',
            },
            {
                label: 'spreadsheet/custom_column/column_content',
                dataKey: FORMULA,
                initialValue: null,
                editable: true,
                extra: CustomColumnTooltip,
                width: '70%',
            },
        ].map((column) => ({
            ...column,
            label: intl
                .formatMessage({ id: column.label })
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase()),
        }));
    }, [CustomColumnTooltip, intl]);

    const useTabCustomColumnFieldArrayOutput = useFieldArray({
        name: TAB_CUSTOM_COLUMN,
    });

    const newCustomColumnRowData = useMemo(() => {
        const newRowData: any = {};
        CUSTOM_COLUMNS_DEFINITIONS.forEach((column: any) => (newRowData[column.dataKey] = column.initialValue));
        return newRowData;
    }, [CUSTOM_COLUMNS_DEFINITIONS]);

    const createCustomColumnRows = () => [newCustomColumnRowData];
    return (
        <DndTableTyped
            arrayFormName={TAB_CUSTOM_COLUMN}
            columnsDefinition={CUSTOM_COLUMNS_DEFINITIONS}
            useFieldArrayOutput={useTabCustomColumnFieldArrayOutput}
            createRows={createCustomColumnRows}
            tableHeight={380}
            withAddRowsDialog={false}
            withLeftButtons={false}
        />
    );
}
