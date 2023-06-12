/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { CustomAGGrid } from '../../dialogs/custom-aggrid';
import { useTheme } from '@mui/styles';

function makeColumn(isNum, labelId, key, intl) {
    return {
        headerName: intl.formatMessage({ id: labelId }),
        field: key,
        numeric: isNum,
        fractionDigits: isNum ? 4 : undefined,
        comparator: () => 0,
    };
}

function buildTableColumns(nOrNkIndex, functionTypeIndex, intl) {
    const returnedTable = [];
    const labelId = functionTypeIndex < 2 ? 'SupervisedBranches' : 'BusBarBus';

    returnedTable.push(makeColumn(false, labelId, 'funcId', intl));
    returnedTable.push(makeColumn(false, 'VariablesToSimulate', 'varId', intl));

    if (nOrNkIndex === 1) {
        returnedTable.push(
            makeColumn(false, 'ContingencyId', 'contingencyId', intl)
        );
    }

    const suffix1 = 'In' + ['kW', 'kA', 'kV'][functionTypeIndex];
    const suffix = suffix1 + (nOrNkIndex !== 1 ? '' : 'BeforeContingency');

    returnedTable.push(
        makeColumn(true, 'ValRef' + suffix, 'functionReference', intl)
    );
    returnedTable.push(makeColumn(true, 'Delta' + suffix, 'value', intl));

    if (nOrNkIndex === 1) {
        returnedTable.push(
            makeColumn(true, 'ValRef' + suffix1, 'functionReferenceAfter', intl)
        );
        returnedTable.push(
            makeColumn(true, 'Delta' + suffix1, 'valueAfter', intl)
        );
    }

    return returnedTable;
}

function makeRows(resultRecord) {
    // Replace NaN values by empty string
    return resultRecord.map((obj) => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            acc[key] = value === 'NaN' ? '' : value;
            return acc;
        }, {});
    });
}

const SensitivityAnalysisResult = ({
    result,
    nOrNkIndex,
    sensiToIndex,
    onSortChanged,
}) => {
    const gridRef = useRef(null);
    const intl = useIntl();
    const theme = useTheme();

    const columns = useMemo(
        () => buildTableColumns(nOrNkIndex, sensiToIndex, intl),
        [nOrNkIndex, sensiToIndex, intl]
    );

    const rows = useMemo(() => makeRows(result), [result]);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            sortable: true,
            suppressMultiSort: true,
        }),
        []
    );

    const getRowStyle = useCallback(
        (params) => {
            if (params?.data?.elementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );

    const onGridReady = useCallback((params) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.api?.refreshCells();
        }
    }, [result]);

    return (
        <div style={{ flexGrow: 1 }}>
            <CustomAGGrid
                ref={gridRef}
                rowData={rows}
                columnDefs={columns}
                getRowStyle={getRowStyle}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                onSortChanged={onSortChanged}
            />
        </div>
    );
};

SensitivityAnalysisResult.defaultProps = {
    result: null,
    nOrNkIndex: 0,
    sensiToIndex: 0,
};

SensitivityAnalysisResult.propTypes = {
    result: PropTypes.array.isRequired,
    nOrNkIndex: PropTypes.number.isRequired,
    sensiToIndex: PropTypes.number.isRequired,
    onSortChanged: PropTypes.func.isRequired,
};

export default SensitivityAnalysisResult;
