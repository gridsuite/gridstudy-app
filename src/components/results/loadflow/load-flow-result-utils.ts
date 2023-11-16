/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    LimitNames,
    LimitTypes,
    OverloadedEquipment,
    OverloadedEquipmentFromBack,
} from './load-flow-result.type';
import { IntlShape } from 'react-intl';
import {
    ICellRendererParams,
    ValueFormatterParams,
    ColDef,
} from 'ag-grid-community';
import { BranchSide } from '../../utils/constants';
import { convertDuration } from '../../spreadsheet/utils/cell-renderers';

const UNDEFINED_ACCEPTABLE_DURATION = Math.pow(2, 31) - 1;
const PERMANENT_LIMIT_NAME = 'permanent';

export const convertSide = (side: string, intl: IntlShape) => {
    return side === BranchSide.ONE
        ? intl.formatMessage({ id: 'Side1' })
        : side === BranchSide.TWO
        ? intl.formatMessage({ id: 'Side2' })
        : undefined;
};
export const convertLimitName = (limitName: string | null, intl: IntlShape) => {
    return limitName === PERMANENT_LIMIT_NAME
        ? intl.formatMessage({ id: 'PermanentLimitName' })
        : limitName;
};
export const makeData = (
    overloadedEquipment: OverloadedEquipmentFromBack,
    intl: IntlShape
): OverloadedEquipment => {
    return {
        overload: (overloadedEquipment.value / overloadedEquipment.limit) * 100,
        name: overloadedEquipment.subjectId,
        value: overloadedEquipment.value,
        acceptableDuration:
            overloadedEquipment.acceptableDuration ===
            UNDEFINED_ACCEPTABLE_DURATION
                ? null
                : overloadedEquipment.acceptableDuration,
        actualOverload:
            overloadedEquipment.actualOverload === UNDEFINED_ACCEPTABLE_DURATION
                ? null
                : overloadedEquipment.actualOverload,
        upComingOverload:
            overloadedEquipment.upComingOverload ===
            UNDEFINED_ACCEPTABLE_DURATION
                ? null
                : overloadedEquipment.upComingOverload,
        limit: overloadedEquipment.limit,
        limitName: convertLimitName(overloadedEquipment.limitName, intl),
        side: convertSide(overloadedEquipment.side, intl),
        limitType: overloadedEquipment.limitType,
    };
};

export const loadFlowCurrentViolationsColumnsDefinition = (
    intl: IntlShape
): ColDef[] => {
    return [
        {
            headerName: intl.formatMessage({ id: 'OverloadedEquipment' }),
            field: 'name',
        },
        {
            headerName: intl.formatMessage({
                id: 'LimitNameCurrentViolation',
            }),
            valueFormatter: (params: ValueFormatterParams) =>
                formatLimitName(params.value, intl),
            field: 'limitName',
        },
        {
            headerName: intl.formatMessage({ id: 'CurrentViolationLimit' }),
            field: 'limit',
            valueFormatter: (params: ValueFormatterParams) =>
                params.value.toFixed(1),
        },
        {
            headerName: intl.formatMessage({ id: 'CurrentViolationValue' }),
            field: 'value',
            numeric: true,
            valueFormatter: (params: ValueFormatterParams) =>
                params.value.toFixed(1),
        },
        {
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'overload',
            numeric: true,
            fractionDigits: 0,
            valueFormatter: (params: ValueFormatterParams) =>
                params.value.toFixed(1),
        },
        {
            headerName: intl.formatMessage({
                id: 'ActualOverload',
            }),
            field: 'actualOverload',
            valueFormatter: (value: ValueFormatterParams) =>
                convertDuration(value.data.actualOverload),
        },
        {
            headerName: intl.formatMessage({ id: 'upComingOverlaod' }),
            field: 'upComingOverload',
            valueFormatter: (value: ValueFormatterParams) => {
                return value.data.upComingOverload !== null
                    ? convertDuration(value.data.upComingOverload)
                    : intl.formatMessage({ id: 'NoneUpcomingOverload' });
            },
        },
        {
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
        },
    ];
};

export const formatLimitName = (limiName: string, intl: IntlShape) => {
    return limiName === LimitNames.NA
        ? intl.formatMessage({ id: 'Undefined' })
        : limiName;
};
export const formatLimitType = (limitType: string, intl: IntlShape) => {
    return limitType in LimitTypes
        ? intl.formatMessage({ id: limitType })
        : limitType;
};
export const loadFlowVoltageViolationsColumnsDefinition = (
    intl: IntlShape
): ColDef[] => {
    return [
        {
            headerName: intl.formatMessage({ id: 'VoltageLevel' }),
            field: 'name',
        },
        {
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            field: 'limitType',
            valueFormatter: (params: ValueFormatterParams) =>
                formatLimitType(params.value, intl),
        },
        {
            headerName: intl.formatMessage({ id: 'VoltageViolationLimit' }),
            field: 'limit',
            valueFormatter: (params: ValueFormatterParams) =>
                params.value.toFixed(1),
        },
        {
            headerName: intl.formatMessage({ id: 'VoltageViolationValue' }),
            field: 'value',
            numeric: true,
            valueFormatter: (params: ValueFormatterParams) =>
                params.value.toFixed(1),
        },
    ];
};

export const loadFlowResultColumnsDefinition = (
    intl: IntlShape,
    statusCellRender: (cellData: ICellRendererParams) => React.JSX.Element,
    numberRenderer: (cellData: ICellRendererParams) => React.JSX.Element
): ColDef[] => {
    return [
        {
            headerName: intl.formatMessage({
                id: 'connectedComponentNum',
            }),
            field: 'connectedComponentNum',
        },
        {
            headerName: intl.formatMessage({
                id: 'synchronousComponentNum',
            }),
            field: 'synchronousComponentNum',
        },
        {
            headerName: intl.formatMessage({ id: 'status' }),
            field: 'status',
            cellRenderer: statusCellRender,
        },
        {
            headerName: intl.formatMessage({
                id: 'iterationCount',
            }),
            field: 'iterationCount',
        },
        {
            headerName: intl.formatMessage({
                id: 'slackBusId',
            }),
            field: 'slackBusId',
        },
        {
            headerName: intl.formatMessage({
                id: 'slackBusActivePowerMismatch',
            }),
            field: 'slackBusActivePowerMismatch',
            cellRenderer: numberRenderer,
        },
    ];
};
