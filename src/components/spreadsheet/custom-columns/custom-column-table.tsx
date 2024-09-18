import DndTable from 'components/utils/dnd-table/dnd-table';
import { COLUMN_NAME, FORMULA, TAB_CUSTOM_COLUMN } from './custom-columns-form';
import { SELECTED } from 'components/utils/field-constants';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useFieldArray } from 'react-hook-form';

export default function CustomColumnTable() {
    const DndTableTyped = DndTable as React.ComponentType<any>;
    const intl = useIntl();
    const CUSTOM_COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: 'spreadsheet/custom_column/column_name',
                dataKey: COLUMN_NAME,
                initialValue: null,
                editable: true,
                titleId: 'FiltersListsSelection',
            },
            {
                label: 'spreadsheet/custom_column/column_content',
                dataKey: FORMULA,
                initialValue: null,
                editable: true,
                textAlign: 'right',
            },
        ].map((column) => ({
            ...column,
            label: intl
                .formatMessage({ id: column.label })
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase()),
        }));
    }, [intl]);

    const useTabCustomColumnFieldArrayOutput = useFieldArray({
        name: `${TAB_CUSTOM_COLUMN}`,
    });

    const newCustomColumnRowData = useMemo(() => {
        const newRowData: any = {};
        newRowData[SELECTED] = false;
        CUSTOM_COLUMNS_DEFINITIONS.forEach((column: any) => (newRowData[column.dataKey] = column.initialValue));
        return newRowData;
    }, [CUSTOM_COLUMNS_DEFINITIONS]);

    const createCustomColumnRows = () => [newCustomColumnRowData];
    return (
        <DndTableTyped
            arrayFormName={`${TAB_CUSTOM_COLUMN}`}
            columnsDefinition={CUSTOM_COLUMNS_DEFINITIONS}
            useFieldArrayOutput={useTabCustomColumnFieldArrayOutput}
            createRows={createCustomColumnRows}
            tableHeight={270}
            withAddRowsDialog={false}
            withLeftButtons={false}
            handleUploadButton={undefined /*TODO*/}
            uploadButtonMessageId="spreadsheet/custom_column/dialog_edit/upload"
        />
    );
}
