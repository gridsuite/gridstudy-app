/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useFieldArray } from 'react-hook-form';
import { ISensiParameters } from '../components/dialogs/parameters/sensi/columns-definitions';
import { useMemo } from 'react';
import { COUNT } from '../components/utils/field-constants';

export function useCreateRowDataSensi(sensiParam: ISensiParameters) {
    const useFieldArrayOutput = useFieldArray({
        name: sensiParam.name || '',
    });
    const newRowData = useMemo(() => {
        const newRowData: { [key: string]: any } = { [COUNT]: 0 };
        sensiParam.columnsDef.forEach((column) => {
            newRowData[column.dataKey] = column.initialValue;
        });
        return newRowData;
    }, [sensiParam.columnsDef]);

    const createNewRowData = () => [newRowData];

    return [createNewRowData, useFieldArrayOutput] as const;
}
