/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo } from 'react';
import { elementType } from '@gridsuite/commons-ui';
import {
    INJECTIONS_EQUIPMENT_TYPES,
    MONITORED_BRANCHES_EQUIPMENT_TYPES,
} from './sensi-parameters-selector';
import {
    CONTINGENCIES,
    ID,
    INJECTIONS,
    NAME,
    PARAMETER_SENSI_INJECTION,
    SELECTED,
    MONITORED_BRANCHES,
    FILTER_ID,
    FILTER_NAME,
    INJECTION_DISTRIBUTION,
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import { useIntl } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import DndTable from '../../../utils/dnd-table/dnd-table';

export const getSensiInjectionsFormSchema = () => ({
    [PARAMETER_SENSI_INJECTION]: yup.array().of(
        yup.object().shape({
            [MONITORED_BRANCHES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [INJECTIONS]: yup.array().of(
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

export const getSensiInjectionsformatNewParams = (newParams) => {
    return {
        [PARAMETER_SENSI_INJECTION]: newParams.sensitivityInjection.map(
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
                    [INJECTIONS]: sensitivityInjection[INJECTIONS].map(
                        (filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }
                    ),
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

/*export const getSensiInjectionsEmptyFormData = (
    id = PARAMETER_SENSI_INJECTION
) => ({
    [id]: {
        [MONITORED_BRANCHES]: [],
        [INJECTIONS]: [],
        [CONTINGENCIES]: [],
    },
});*/

const SensiInjections = () => {
    const intl = useIntl();

    const useFieldArrayOutput = useFieldArray({
        name: `${PARAMETER_SENSI_INJECTION}`,
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
                label: 'Injections',
                dataKey: INJECTIONS,
                initialValue: [],
                editable: true,
                directoryItems: true,
                equipmentTypes: INJECTIONS_EQUIPMENT_TYPES,
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

    const createSensiInjectionsRows = () => [newRowData];

    return (
        <DndTable
            arrayFormName={`${PARAMETER_SENSI_INJECTION}`}
            columnsDefinition={COLUMNS_DEFINITIONS}
            useFieldArrayOutput={useFieldArrayOutput}
            createRows={createSensiInjectionsRows}
            tableHeight={270}
            withAddRowsDialog={false}
            withLeftButtons={false}
        />
    );
};

export default SensiInjections;
