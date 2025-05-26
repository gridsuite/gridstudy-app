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
import DndTable from 'components/utils/dnd-table/dnd-table';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { ElementType } from '@gridsuite/commons-ui';
import { Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { DndColumnType } from 'components/utils/dnd-table/dnd-table.type';

const FrequencyReservePane = ({ id = GENERATORS_FREQUENCY_RESERVES }) => {
    const intl = useIntl();

    const columnsDefinition = useMemo(() => {
        return [
            {
                label: 'GeneratorFilter',
                dataKey: GENERATORS_FILTERS,
                initialValue: [],
                editable: true,
                type: DndColumnType.DIRECTORY_ITEMS,
                equipmentTypes: [EQUIPMENT_TYPES.GENERATOR],
                elementType: ElementType.FILTER,
                titleId: 'FiltersListsSelection',
            },
            {
                label: 'FrequencyReserve',
                dataKey: FREQUENCY_RESERVE,
                initialValue: null,
                editable: true,
                type: DndColumnType.NUMERIC,
            },
        ].map((column) => ({
            ...column,
            label: intl
                .formatMessage({ id: column.label })
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase()),
        }));
    }, [intl]);

    const useFieldArrayOutputFrequencyReserve = useFieldArray({
        name: `${id}`,
    });

    const newRowData = useMemo(() => {
        const newRowData = {};
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
        <>
            <DndTable
                arrayFormName={`${id}`}
                useFieldArrayOutput={useFieldArrayOutputFrequencyReserve}
                createRows={createFrequencyReserveRows}
                columnsDefinition={completedColumnsDefinition}
                tableHeight={270}
                withLeftButtons={false}
                withAddRowsDialog={false}
            />
        </>
    );
};

export default FrequencyReservePane;
