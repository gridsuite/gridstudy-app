/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SUBSTATIONS_GENERATORS_ORDERING, SUBSTATION_IDS } from 'components/utils/field-constants';
import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import DndTable from 'components/utils/dnd-table/dnd-table';
import { DndColumnType } from 'components/utils/dnd-table/dnd-table.type';

const SubstationsGeneratorsOrderingPane = ({ id = SUBSTATIONS_GENERATORS_ORDERING }) => {
    const intl = useIntl();

    const columnsDefinition = useMemo(() => {
        return [
            {
                label: 'Substations',
                dataKey: SUBSTATION_IDS,
                initialValue: [],
                editable: true,
                type: DndColumnType.CHIP_ITEMS,
            },
        ].map((column) => ({
            ...column,
            label: intl
                .formatMessage({ id: column.label })
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase()),
        }));
    }, [intl]);

    const useFieldArraySubstationsGeneratorsOrdering = useFieldArray({
        name: `${id}`,
    });

    const newRowData = useMemo(() => {
        const newRowData = {};
        columnsDefinition.forEach((column) => (newRowData[column.dataKey] = column.initialValue));
        return newRowData;
    }, [columnsDefinition]);
    const createSubstationsGeneratorsOrderingRows = () => [newRowData];

    return (
        <>
            <DndTable
                arrayFormName={`${id}`}
                useFieldArrayOutput={useFieldArraySubstationsGeneratorsOrdering}
                createRows={createSubstationsGeneratorsOrderingRows}
                columnsDefinition={columnsDefinition}
                tableHeight={270}
                withLeftButtons={false}
                withAddRowsDialog={false}
            />
        </>
    );
};

export default SubstationsGeneratorsOrderingPane;
