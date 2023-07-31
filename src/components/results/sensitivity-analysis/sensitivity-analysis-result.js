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
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';

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
    const sensitivityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );
    const messages = useIntlResultStatusMessages(intl, true);
    const makeColumn = useCallback(
        (field, labelId, isNum = false) => {
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
                'funcId',
                sensiToIndex < 2 ? 'SupervisedBranches' : 'BusBarBus'
            )
        );
        returnedTable.push(makeColumn('varId', 'VariablesToSimulate'));

        if (nOrNkIndex === 1) {
            returnedTable.push(makeColumn('contingencyId', 'ContingencyId'));
        }

        const suffix1 = 'In' + ['kW', 'kA', 'kV'][sensiToIndex];
        const suffix = suffix1 + (nOrNkIndex !== 1 ? '' : 'BeforeContingency');

        returnedTable.push(
            makeColumn('functionReference', 'ValRef' + suffix, true)
        );
        returnedTable.push(makeColumn('value', 'Delta' + suffix, true));

        if (nOrNkIndex === 1) {
            returnedTable.push(
                makeColumn('functionReferenceAfter', 'ValRef' + suffix1, true)
            );
            returnedTable.push(
                makeColumn('valueAfter', 'Delta' + suffix1, true)
            );
        }

        return returnedTable;
    }, [makeColumn, nOrNkIndex, sensiToIndex]);

    const rows = useMemo(() => makeRows(result), [result]);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            sortable: true,
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
    const message = getNoRowsMessage(messages, rows, sensitivityAnalysisStatus);

    const rowsToShow = getRows(rows, sensitivityAnalysisStatus);
    return (
        <div style={{ flexGrow: 1 }}>
            <CustomAGGrid
                ref={gridRef}
                rowData={rowsToShow}
                columnDefs={columnsDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                onSortChanged={onSortChanged}
                gridOptions={gridOptions}
                overlayNoRowsTemplate={message}
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
