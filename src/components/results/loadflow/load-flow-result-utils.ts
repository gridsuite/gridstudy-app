/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    LimitTypes,
    OverloadedEquipment,
    OverloadedEquipmentFromBack,
} from './load-flow-result.type';
import { IntlShape } from 'react-intl';
import {
    ColDef,
    ICellRendererParams,
    ValueFormatterParams,
} from 'ag-grid-community';
import { BranchSide } from '../../utils/constants';
import {
    convertDuration,
    formatNAValue,
} from '../../spreadsheet/utils/cell-renderers';
import { UNDEFINED_ACCEPTABLE_DURATION } from '../../utils/utils';

const PERMANENT_LIMIT_NAME = 'permanent';

export const convertMillisecondsToMinutesSeconds = (
    durationInMilliseconds: number
): string => {
    const durationInSeconds = Math.floor(durationInMilliseconds / 1000);

    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;

    if (seconds === 0) {
        return minutes + "'";
    }

    if (minutes === 0) {
        return seconds + '"';
    }

    return minutes + "' " + seconds + '"';
};

export const convertSide = (side: string | undefined, intl: IntlShape) => {
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
        actualOverloadDuration:
            overloadedEquipment.actualOverloadDuration ===
            UNDEFINED_ACCEPTABLE_DURATION
                ? null
                : overloadedEquipment.actualOverloadDuration,
        upComingOverloadDuration: overloadedEquipment.upComingOverloadDuration,
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
                formatNAValue(params.value, intl),
            field: 'limitName',
        },
        {
            headerName: intl.formatMessage({ id: 'CurrentViolationLimit' }),
            field: 'limit',
            numeric: true,
            fractionDigits: 2,
        },
        {
            headerName: intl.formatMessage({ id: 'CurrentViolationValue' }),
            field: 'value',
            numeric: true,
            fractionDigits: 2,
        },
        {
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'overload',
            numeric: true,
            fractionDigits: 2,
        },
        {
            headerName: intl.formatMessage({
                id: 'actualOverloadDuration',
            }),
            field: 'actualOverloadDuration',
            valueFormatter: (value: ValueFormatterParams) =>
                convertDuration(value.data.actualOverloadDuration),
        },
        {
            headerName: intl.formatMessage({ id: 'upComingOverloadDuration' }),
            field: 'upComingOverloadDuration',
            valueFormatter: (value: ValueFormatterParams) => {
                if (value.data.upComingOverloadDuration === null) {
                    return intl.formatMessage({ id: 'NoneUpcomingOverload' });
                } else if (
                    value.data.upComingOverloadDuration ===
                    UNDEFINED_ACCEPTABLE_DURATION
                ) {
                    return ' ';
                }
                return convertDuration(value.data.upComingOverloadDuration);
            },
        },
        {
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
        },
    ];
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
            numeric: true,
            fractionDigits: 2,
        },
        {
            headerName: intl.formatMessage({ id: 'VoltageViolationValue' }),
            field: 'value',
            numeric: true,
            fractionDigits: 2,
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
            numeric: true,
            fractionDigits: 2,
        },
        {
            headerName: intl.formatMessage({
                id: 'synchronousComponentNum',
            }),
            field: 'synchronousComponentNum',
            numeric: true,
            fractionDigits: 2,
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
            numeric: true,
            fractionDigits: 2,
            cellRenderer: numberRenderer,
        },
    ];
};
