/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import { useTheme } from '@mui/styles';
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
import { DATA_KEY_TO_FILTER_KEY } from './sensitivity-analysis-content';

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
    filtersDef,
    onSortChanged,
    sortConfig,
    updateFilter,
    filterSelector,
}) => {
    const gridRef = useRef(null);
    const intl = useIntl();
    const theme = useTheme();

    const makeColumn = useCallback(
        (isNum, labelId, field) => {
            const { options: filterOptions = [] } =
                filtersDef.find((filterDef) => filterDef?.field === field) ||
                {};

            const filterSelectedOption =
                DATA_KEY_TO_FILTER_KEY[field] &&
                filterSelector[DATA_KEY_TO_FILTER_KEY[field]]?.[0];

            return {
                field,
                numeric: isNum,
                fractionDigits: isNum ? 4 : undefined,
                headerComponentFramework: CustomHeaderComponent,
                headerComponentParams: {
                    field,
                    displayName: intl.formatMessage({ id: labelId }),
                    filterOptions,
                    sortConfig,
                    onSortChanged: (newSortValue) =>
                        onSortChanged(field, newSortValue),
                    updateFilter,
                    filterSelectedOption,
                },
            };
        },
        [
            filtersDef,
            filterSelector,
            intl,
            sortConfig,
            updateFilter,
            onSortChanged,
        ]
    );

    const columnsDefs = useMemo(() => {
        const returnedTable = [];

        returnedTable.push(
            makeColumn(
                false,
                sensiToIndex < 2 ? 'SupervisedBranches' : 'BusBarBus',
                'funcId'
            )
        );
        returnedTable.push(makeColumn(false, 'VariablesToSimulate', 'varId'));

        if (nOrNkIndex === 1) {
            returnedTable.push(
                makeColumn(false, 'ContingencyId', 'contingencyId')
            );
        }

        const suffix1 = 'In' + ['kW', 'kA', 'kV'][sensiToIndex];
        const suffix = suffix1 + (nOrNkIndex !== 1 ? '' : 'BeforeContingency');

        returnedTable.push(
            makeColumn(true, 'ValRef' + suffix, 'functionReference')
        );
        returnedTable.push(makeColumn(true, 'Delta' + suffix, 'value'));

        if (nOrNkIndex === 1) {
            returnedTable.push(
                makeColumn(true, 'ValRef' + suffix1, 'functionReferenceAfter')
            );
            returnedTable.push(
                makeColumn(true, 'Delta' + suffix1, 'valueAfter')
            );
        }

        return returnedTable;
    }, [makeColumn, nOrNkIndex, sensiToIndex]);

    const rows = useMemo(() => makeRows(result), [result]);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
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
                columnDefs={columnsDefs}
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
    sortConfig: PropTypes.object.isRequired,
    filtersDef: PropTypes.array.isRequired,
    updateFilter: PropTypes.func.isRequired,
    filterSelector: PropTypes.object.isRequired,
};

export default SensitivityAnalysisResult;
