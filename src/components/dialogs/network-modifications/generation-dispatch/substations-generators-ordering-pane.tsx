/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SUBSTATIONS_GENERATORS_ORDERING, SUBSTATION_IDS } from 'components/utils/field-constants';
import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { DndTable, DndColumnType, DndColumn } from '@gridsuite/commons-ui';
import SubstationsAutocomplete from './substations-autocomplete.js';

interface SubstationsGeneratorsOrderingPaneProps {
    substations: string[];
}

export type EnrichedDndColumn = DndColumn & { initialValue: unknown[] | null };

const SubstationsGeneratorsOrderingPane = ({ substations }: Readonly<SubstationsGeneratorsOrderingPaneProps>) => {
    const intl = useIntl();
    const id = SUBSTATIONS_GENERATORS_ORDERING;

    const columnsDefinition = useMemo<EnrichedDndColumn[]>(() => {
        return [
            {
                label: intl
                    .formatMessage({ id: 'Substations' })
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase()),
                dataKey: SUBSTATION_IDS,
                initialValue: [] as unknown[],
                editable: true,
                type: DndColumnType.CUSTOM,
                component: (rowIndex: number) =>
                    SubstationsAutocomplete({
                        name: `${id}[${rowIndex}].${SUBSTATION_IDS}`,
                        substations: substations,
                    }),
            },
        ];
    }, [intl, substations, id]);

    const useFieldArraySubstationsGeneratorsOrdering = useFieldArray({
        name: `${id}`,
    });

    const newRowData = useMemo(() => {
        const newRowData: Record<string, unknown[] | null> = {};
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
                withAddRowsDialog={false}
            />
        </>
    );
};

export default SubstationsGeneratorsOrderingPane;
