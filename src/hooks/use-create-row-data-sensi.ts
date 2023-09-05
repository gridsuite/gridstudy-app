import { SELECTED } from '../components/utils/field-constants';
import { useFieldArray } from 'react-hook-form';
import { ISensiParameters } from '../components/dialogs/parameters/sensi/columns-definitions';
import { useMemo } from 'react';

export const useCreateRowDataSensi = (sensiParam: ISensiParameters) => {
    const useFieldArrayOutput = useFieldArray({
        name: `${sensiParam.name}`,
    });
    const newRowData = useMemo(() => {
        const newRowData: { [key: string]: any } = { [SELECTED]: false };
        sensiParam.columnsDef.forEach((column) => {
            newRowData[column.dataKey] = column.initialValue;
        });
        return newRowData;
    }, [sensiParam.columnsDef]);

    const createNewRowData = () => [newRowData];

    return [createNewRowData, useFieldArrayOutput];
};
