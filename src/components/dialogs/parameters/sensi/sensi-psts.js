/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo } from 'react';
import { elementType } from '@gridsuite/commons-ui';
import {
    MONITORED_BRANCHES_EQUIPMENT_TYPES,
    PSTS_EQUIPMENT_TYPES,
    SENSITIVITY_TYPES,
} from './sensi-parameters-selector';
import {
    CONTINGENCIES,
    ID,
    NAME,
    PARAMETER_SENSI_PST,
    PSTS,
    SELECTED,
    SENSITIVITY_TYPE,
    MONITORED_BRANCHES,
    FILTER_ID,
    FILTER_NAME,
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import { useIntl } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import DndTable from '../../../utils/dnd-table/dnd-table';

export const getSensiPSTsFormSchema = () => ({
    [PARAMETER_SENSI_PST]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [SENSITIVITY_TYPE]: yup.string().nullable(),
            [PSTS]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [CONTINGENCIES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
        })
    ),
});

export const getSensiPstformatNewParams = (newParams) => {
    return {
        [PARAMETER_SENSI_PST]: newParams.sensitivityPST.map(
            (sensitivityInjection) => {
                return {
                    [MONITORED_BRANCHES]: sensitivityInjection[
                        MONITORED_BRANCHES
                    ].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [PSTS]: sensitivityInjection[PSTS].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [SENSITIVITY_TYPE]: sensitivityInjection[SENSITIVITY_TYPE],
                    [CONTINGENCIES]: sensitivityInjection[CONTINGENCIES].map(
                        (filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }
                    ),
                };
            }
        ),
    };
};

const SensiPSTs = () => {
    const intl = useIntl();

    const useFieldArrayOutput = useFieldArray({
        name: `${PARAMETER_SENSI_PST}`,
    });

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: 'SupervisedBranches',
                dataKey: MONITORED_BRANCHES,
                initialValue: [],
                editable: true,
                directoryItems: true,
                equipmentTypes: MONITORED_BRANCHES_EQUIPMENT_TYPES,
                elementType: elementType.FILTER,
                titleId: 'FiltersListsSelection',
            },
            {
                label: 'SensitivityType',
                dataKey: SENSITIVITY_TYPE,
                equipmentTypes: SENSITIVITY_TYPES,
                initialValue: SENSITIVITY_TYPES[0].id,
                menuItem: true,
                editable: true,
            },
            {
                label: 'PSTS',
                dataKey: PSTS,
                initialValue: [],
                editable: true,
                directoryItems: true,
                equipmentTypes: PSTS_EQUIPMENT_TYPES,
                elementType: elementType.FILTER,
                titleId: 'FiltersListsSelection',
            },
            {
                label: 'ContingencyLists',
                dataKey: CONTINGENCIES,
                initialValue: [],
                editable: true,
                directoryItems: true,
                elementType: elementType.CONTINGENCY_LIST,
                titleId: 'ContingencyListsSelection',
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }).toUpperCase(),
        }));
    }, [intl]);

    const newRowData = useMemo(() => {
        const newRowData = {};
        newRowData[SELECTED] = false;
        COLUMNS_DEFINITIONS.forEach(
            (column) => (newRowData[column.dataKey] = column.initialValue)
        );
        return newRowData;
    }, [COLUMNS_DEFINITIONS]);

    const createSensiPSTsRows = () => [newRowData];

    return (
        <DndTable
            arrayFormName={`${PARAMETER_SENSI_PST}`}
            columnsDefinition={COLUMNS_DEFINITIONS}
            useFieldArrayOutput={useFieldArrayOutput}
            createRows={createSensiPSTsRows}
            tableHeight={270}
            withAddRowsDialog={false}
            withLeftButtons={false}
        />
    );
};

export default SensiPSTs;
