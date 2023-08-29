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
    EQUIPMENTS_IN_VOLTAGE_REGULATION,
    FILTER_ID,
    FILTER_NAME,
    ID,
    NAME,
    PARAMETER_SENSI_NODES,
    SELECTED,
    SUPERVISED_VOLTAGE_LEVELS,
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import DndTable from '../../../utils/dnd-table/dnd-table';
import { useIntl } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import {
    EQUIPMENTS_IN_VOLTAGE_REGULATION_TYPES,
    MONITORED_VOLTAGE_LEVELS_EQUIPMENT_TYPES,
} from './sensi-parameters-selector';

export const getSensiNodesFormSchema = () => ({
    [PARAMETER_SENSI_NODES]: yup.array().of(
        yup.object().shape({
            [SUPERVISED_VOLTAGE_LEVELS]: yup.array().of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            ),
            [EQUIPMENTS_IN_VOLTAGE_REGULATION]: yup.array().of(
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

export const getSensiNodesformatNewParams = (newParams) => {
    return {
        [PARAMETER_SENSI_NODES]: newParams.sensitivityNodes.map(
            (sensitivityInjection) => {
                return {
                    [SUPERVISED_VOLTAGE_LEVELS]: sensitivityInjection[
                        SUPERVISED_VOLTAGE_LEVELS
                    ].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [EQUIPMENTS_IN_VOLTAGE_REGULATION]: sensitivityInjection[
                        EQUIPMENTS_IN_VOLTAGE_REGULATION
                    ].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
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

const SensiNodes = () => {
    const intl = useIntl();

    const useFieldArrayOutput = useFieldArray({
        name: `${PARAMETER_SENSI_NODES}`,
    });

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: 'MonitoredVoltageLevels',
                dataKey: SUPERVISED_VOLTAGE_LEVELS,
                initialValue: [],
                editable: true,
                directoryItems: true,
                equipmentTypes: MONITORED_VOLTAGE_LEVELS_EQUIPMENT_TYPES,
                elementType: elementType.FILTER,
                titleId: 'FiltersListsSelection',
            },
            {
                label: 'EquipmentsInVoltageRegulation',
                dataKey: EQUIPMENTS_IN_VOLTAGE_REGULATION,
                initialValue: [],
                editable: true,
                directoryItems: true,
                equipmentTypes: EQUIPMENTS_IN_VOLTAGE_REGULATION_TYPES,
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

    const createSensiNodesRows = () => [newRowData];

    return (
        <DndTable
            arrayFormName={`${PARAMETER_SENSI_NODES}`}
            columnsDefinition={COLUMNS_DEFINITIONS}
            useFieldArrayOutput={useFieldArrayOutput}
            createRows={createSensiNodesRows}
            tableHeight={270}
            withAddRowsDialog={false}
            withLeftButtons={false}
        />
    );
};

export default SensiNodes;
