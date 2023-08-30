/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo } from 'react';
import { elementType } from '@gridsuite/commons-ui';
import {
    CONTINGENCIES,
    FILTER_ID,
    FILTER_NAME,
    ID,
    INJECTIONS,
    NAME,
    PARAMETER_SENSI_INJECTIONS_SET,
    SELECTED,
    MONITORED_BRANCHES,
    DISTRIBUTION_TYPE,
} from '../../../utils/field-constants';

import yup from '../../../utils/yup-config';
import { useIntl } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import DndTable from '../../../utils/dnd-table/dnd-table';
import {
    INJECTION_DISTRIBUTION_TYPES,
    INJECTIONS_EQUIPMENT_TYPES,
    MONITORED_BRANCHES_EQUIPMENT_TYPES,
} from './sensi-parameters-selector';

export const getSensiInjectionsSetFormSchema = () => ({
    [PARAMETER_SENSI_INJECTIONS_SET]: yup.array().of(
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
            [DISTRIBUTION_TYPE]: yup.string().nullable(),
            [CONTINGENCIES]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
        })
    ),
});

export const getSensiInjectionsSetformatNewParams = (newParams) => {
    return {
        [PARAMETER_SENSI_INJECTIONS_SET]:
            newParams.sensitivityInjectionsSet.map(
                (sensitivityInjectionSet) => {
                    return {
                        [MONITORED_BRANCHES]: sensitivityInjectionSet[
                            MONITORED_BRANCHES
                        ].map((filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }),
                        [INJECTIONS]: sensitivityInjectionSet[INJECTIONS].map(
                            (filter) => {
                                return {
                                    [FILTER_ID]: filter[ID],
                                    [FILTER_NAME]: filter[NAME],
                                };
                            }
                        ),
                        [DISTRIBUTION_TYPE]:
                            sensitivityInjectionSet[DISTRIBUTION_TYPE],
                        [CONTINGENCIES]: sensitivityInjectionSet[
                            CONTINGENCIES
                        ].map((filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }),
                    };
                }
            ),
    };
};

const SensiInjectionsSet = () => {
    const intl = useIntl();

    const useFieldArrayOutput = useFieldArray({
        name: `${PARAMETER_SENSI_INJECTIONS_SET}`,
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
                label: 'DistributionType',
                dataKey: DISTRIBUTION_TYPE,
                equipmentTypes: INJECTION_DISTRIBUTION_TYPES,
                initialValue: INJECTION_DISTRIBUTION_TYPES[0].id,
                menuItem: true,
                editable: true,
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

    const createSensiInjectionsSetRows = () => [newRowData];

    return (
        <DndTable
            arrayFormName={`${PARAMETER_SENSI_INJECTIONS_SET}`}
            columnsDefinition={COLUMNS_DEFINITIONS}
            useFieldArrayOutput={useFieldArrayOutput}
            createRows={createSensiInjectionsSetRows}
            tableHeight={270}
            withAddRowsDialog={false}
            withLeftButtons={false}
        />
    );
};

export default SensiInjectionsSet;
