/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { DndColumn, DndColumnType, DndTable, ElementType, EquipmentType } from '@gridsuite/commons-ui';
import { FILTER, INVALIDATE, INVALIDATION_TYPE, AREA_INVALIDATIONS } from '../../../utils/field-constants';
import { InvalidationType, TabValue } from './state-estimation-parameters-utils';

const invalidationTypeLabelIds: Record<InvalidationType, string> = {
    [InvalidationType.ERRONEOUS_TOPOLOGY_PV]: 'StateEstimationParametersInvalidationTypeErroneousTopologyPv',
    [InvalidationType.ERRONEOUS_TOPOLOGY_PQ]: 'StateEstimationParametersInvalidationTypeErroneousTopologyPq',
    [InvalidationType.NOT_FULLY_DESCRIBED]: 'StateEstimationParametersInvalidationTypeNotFullyDescribed',
};

export const StateEstimationRelaxationParameters: FunctionComponent = () => {
    const intl = useIntl();
    const formName = `${TabValue.AREA_INVALIDATION}.${AREA_INVALIDATIONS}`;

    const columnsDefinition = useMemo<DndColumn[]>(() => {
        const filtersHeaderTooltip = (
            <Tooltip title={intl.formatMessage({ id: 'StateEstimationParametersRelaxationTooltip' })} placement="right">
                <span>
                    <IconButton disabled size="small">
                        <InfoIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        );

        return [
            {
                label: intl.formatMessage({ id: 'StateEstimationParametersInvalidateLabel' }),
                dataKey: INVALIDATE,
                initialValue: false,
                editable: true,
                type: DndColumnType.SWITCH,
                dataTestId: 'SiteRelaxationInvalidateInput',
            },
            {
                label: intl.formatMessage({ id: 'StateEstimationParametersSiteFilterLabel' }),
                dataKey: FILTER,
                initialValue: [],
                editable: true,
                type: DndColumnType.DIRECTORY_ITEMS,
                equipmentTypes: [EquipmentType.SUBSTATION],
                elementType: ElementType.FILTER,
                titleId: 'StateEstimationParametersRelaxationFilterSelection',
                dataTestId: 'SiteRelaxationFilterInput',
                extra: filtersHeaderTooltip,
            },
            {
                label: intl.formatMessage({ id: 'StateEstimationParametersInvalidationTypeLabel' }),
                dataKey: INVALIDATION_TYPE,
                initialValue: InvalidationType.ERRONEOUS_TOPOLOGY_PV,
                editable: true,
                type: DndColumnType.SELECT,
                options: Object.values(InvalidationType).map((invalidationType) => ({
                    id: invalidationType,
                    label: intl.formatMessage({ id: invalidationTypeLabelIds[invalidationType] }),
                })),
                dataTestId: 'SiteRelaxationInvalidationTypeInput',
            },
        ] satisfies DndColumn[];
    }, [intl]);

    const useFieldArrayOutput = useFieldArray({ name: formName });

    const createRows = () => {
        const newRowData: Record<string, unknown> = {};
        columnsDefinition.forEach((column) => (newRowData[column.dataKey] = column.initialValue));
        return [newRowData];
    };

    return (
        <DndTable
            name={formName}
            useFieldArrayOutput={useFieldArrayOutput}
            createRows={createRows}
            columnsDefinition={columnsDefinition}
            tableHeight={440}
            withAddRowsDialog={false}
            rowDataTestId="SiteRelaxationLine"
        />
    );
};
