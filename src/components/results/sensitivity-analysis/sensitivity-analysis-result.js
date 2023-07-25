/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import React, { useCallback, useMemo, useRef } from 'react';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import {
    DATA_KEY_TO_FILTER_KEY,
    DATA_KEY_TO_SORT_KEY,
} from './sensitivity-analysis-content';
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
import { TOOLTIP_DELAY } from 'utils/UIconstants';

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

    const makeColumn = useCallback(
        ({ field, labelId, isNum = false, pinned = false, maxWidth }) => {
            const { options: filterOptions = [] } =
                filtersDef.find((filterDef) => filterDef?.field === field) ||
                {};

            const filterSelectedOption =
                DATA_KEY_TO_FILTER_KEY[field] &&
                filterSelector?.[DATA_KEY_TO_FILTER_KEY[field]]?.[0];

            return {
                field,
                numeric: isNum,
                fractionDigits: isNum ? 4 : undefined,
                headerComponent: CustomHeaderComponent,
                headerComponentParams: {
                    field,
                    displayName: intl.formatMessage({ id: labelId }),
                    filterOptions,
                    sortConfig,
                    onSortChanged: (newSortValue) =>
                        onSortChanged(
                            DATA_KEY_TO_SORT_KEY[field],
                            newSortValue
                        ),
                    updateFilter,
                    filterSelectedOption,
                },
                maxWidth: maxWidth,
                wrapHeaderText: true,
                autoHeaderHeight: true,
                pinned: pinned,
                headerTooltip: intl.formatMessage({ id: labelId }),
                tooltipField: intl.formatMessage({ id: field }),
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
            makeColumn({
                field: 'funcId',
                labelId: sensiToIndex < 2 ? 'SupervisedBranches' : 'BusBarBus',
                pinned: true,
                maxWidth: 350,
            })
        );
        returnedTable.push(
            makeColumn({
                field: 'varId',
                labelId: 'VariablesToSimulate',
                pinned: true,
            })
        );

        if (nOrNkIndex === 1) {
            returnedTable.push(
                makeColumn({
                    field: 'contingencyId',
                    labelId: 'ContingencyId',
                    pinned: true,
                })
            );
        }

        const suffix1 = 'In' + ['kW', 'kA', 'kV'][sensiToIndex];
        const suffix = suffix1 + (nOrNkIndex !== 1 ? '' : 'BeforeContingency');

        returnedTable.push(
            makeColumn({
                field: 'functionReference',
                labelId: 'ValRef' + suffix,
                isNum: true,
            })
        );
        returnedTable.push(
            makeColumn({
                field: 'value',
                labelId: 'Delta' + suffix,
                isNum: true,
            })
        );

        if (nOrNkIndex === 1) {
            returnedTable.push(
                makeColumn({
                    field: 'functionReferenceAfter',
                    labelId: 'ValRef' + suffix1,
                    isNum: true,
                })
            );
            returnedTable.push(
                makeColumn({
                    field: 'valueAfter',
                    labelId: 'Delta' + suffix1,
                    isNum: true,
                })
            );
        }

        return returnedTable;
    }, [makeColumn, nOrNkIndex, sensiToIndex]);

    const rows = useMemo(() => makeRows(result), [result]);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            sortable: true,
            resizable: true,
            flex: 1,
        }),
        []
    );

    const gridOptions = {
        suppressMultiSort: true,
    };

    const onGridReady = useCallback((params) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    return (
        <div style={{ flexGrow: 1 }}>
            <CustomAGGrid
                ref={gridRef}
                rowData={rows}
                columnDefs={columnsDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                onSortChanged={onSortChanged}
                gridOptions={gridOptions}
                tooltipShowDelay={TOOLTIP_DELAY}
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
    result: PropTypes.array,
    nOrNkIndex: PropTypes.number,
    sensiToIndex: PropTypes.number,
    onSortChanged: PropTypes.func.isRequired,
};

export default SensitivityAnalysisResult;
