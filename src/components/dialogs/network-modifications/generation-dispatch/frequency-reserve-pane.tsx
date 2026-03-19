/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FREQUENCY_RESERVE, GENERATORS_FILTERS, GENERATORS_FREQUENCY_RESERVES } from 'components/utils/field-constants';
import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { DndColumnType, DndTable, ElementType, EquipmentType } from '@gridsuite/commons-ui';
import { EnrichedDndColumn } from './substations-generators-ordering-pane';

interface FrequencyReservePaneProps {
    id?: string;
}

const FrequencyReservePane = ({ id = GENERATORS_FREQUENCY_RESERVES }: Readonly<FrequencyReservePaneProps>) => {
    const intl = useIntl();

    const columnsDefinition = useMemo<EnrichedDndColumn[]>(() => {
        return [
            {
                label: intl
                    .formatMessage({ id: 'GeneratorFilter' })
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase()),
                dataKey: GENERATORS_FILTERS,
                initialValue: [],
                editable: true,
                type: DndColumnType.DIRECTORY_ITEMS,
                equipmentTypes: [EquipmentType.GENERATOR],
                elementType: ElementType.FILTER,
                titleId: 'FiltersListsSelection',
            },
            {
                label: intl
                    .formatMessage({ id: 'FrequencyReserve' })
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase()),
                dataKey: FREQUENCY_RESERVE,
                initialValue: null,
                editable: true,
                type: DndColumnType.NUMERIC,
            },
        ];
    }, [intl]);

    const useFieldArrayOutputFrequencyReserve = useFieldArray({
        name: `${id}`,
    });

    const newRowData = useMemo(() => {
        const newRowData: Record<string, unknown[] | null> = {};
        columnsDefinition.forEach((column) => (newRowData[column.dataKey] = column.initialValue));
        return newRowData;
    }, [columnsDefinition]);
    const createFrequencyReserveRows = () => [newRowData];

    const generatorsFiltersTooltip = (
        <Tooltip
            title={intl.formatMessage({
                id: 'GeneratorsFiltersFrequencyReserveToolTip',
            })}
            placement="left"
        >
            <span>
                <IconButton disabled={true}>
                    <InfoIcon />
                </IconButton>
            </span>
        </Tooltip>
    );

    const completedColumnsDefinition = columnsDefinition;
    completedColumnsDefinition[0] = {
        ...completedColumnsDefinition[0],
        extra: generatorsFiltersTooltip,
    };

    return (
        <DndTable
            arrayFormName={`${id}`}
            useFieldArrayOutput={useFieldArrayOutputFrequencyReserve}
            createRows={createFrequencyReserveRows}
            columnsDefinition={completedColumnsDefinition}
            tableHeight={270}
            withAddRowsDialog={false}
        />
    );
};

export default FrequencyReservePane;
