/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useCallback, useMemo, useRef } from 'react';
import { TOOLTIP_DELAY } from 'utils/UIconstants';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RunningStatus } from '../../utils/running-status';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { Box, LinearProgress } from '@mui/material';
import { mappingTabs, SENSITIVITY_AT_NODE, SUFFIX_TYPES } from './sensitivity-analysis-result-utils';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { SENSITIVITY_ANALYSIS_RESULT_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import { FilterType as AgGridFilterType } from '../../../types/custom-aggrid-types';
import { CustomAggridAutocompleteFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';

function makeRows(resultRecord) {
    // Replace NaN values by empty string
    return resultRecord.map((obj) => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            acc[key] = value === 'NaN' ? '' : value;
            return acc;
        }, {});
    });
}

const SensitivityAnalysisResult = ({ result, nOrNkIndex, sensiKind, filtersDef, onFilter, isLoading, ...props }) => {
    const gridRef = useRef(null);
    const intl = useIntl();
    const sensitivityAnalysisStatus = useSelector((state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]);
    const { onGridColumnsChanged } = props;

    const messages = useIntlResultStatusMessages(intl, true);

    const makeColumn = useCallback(
        ({ field, labelId, isNum = false, pinned = false, maxWidth }) => {
            const { options: filterOptions = [] } = filtersDef.find((filterDef) => filterDef?.field === field) || {};

            return makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: labelId }),
                colId: field,
                field: field,
                context: {
                    numeric: isNum,
                    fractionDigits: isNum ? 2 : undefined,
                    sortParams: {
                        table: SENSITIVITY_ANALYSIS_RESULT_SORT_STORE,
                        tab: mappingTabs(sensiKind, nOrNkIndex),
                    },
                    filterComponent: isNum ? null : CustomAggridAutocompleteFilter,
                    filterComponentParams: {
                        filterParams: {
                            type: AgGridFilterType.SensitivityAnalysis,
                            tab: mappingTabs(sensiKind, nOrNkIndex),
                            updateFilterCallback: onFilter,
                        },
                        options: filterOptions,
                    },
                },
                maxWidth: maxWidth,
                wrapHeaderText: true,
                autoHeaderHeight: true,
                pinned: pinned,
            });
        },
        [filtersDef, intl, nOrNkIndex, onFilter, sensiKind]
    );

    const columnsDefs = useMemo(() => {
        const returnedTable = [];

        returnedTable.push(
            makeColumn({
                field: 'funcId',
                labelId: sensiKind === SENSITIVITY_AT_NODE ? 'BusBarBus' : 'SupervisedBranches',
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

        const suffix1 = 'In' + SUFFIX_TYPES[sensiKind];
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
    }, [makeColumn, nOrNkIndex, sensiKind]);

    const rows = useMemo(() => makeRows(result), [result]);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            sortable: true,
            resizable: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const handleGridReady = useCallback(
        (params) => {
            if (params.api) {
                params.api.sizeColumnsToFit();
                onGridColumnsChanged && onGridColumnsChanged(params);
            }
        },
        [onGridColumnsChanged]
    );

    const message = getNoRowsMessage(messages, rows, sensitivityAnalysisStatus, !isLoading);

    const openLoader = useOpenLoaderShortWait({
        isLoading: sensitivityAnalysisStatus === RunningStatus.RUNNING || isLoading,
        delay: RESULTS_LOADING_DELAY,
    });

    const rowsToShow = getRows(rows, sensitivityAnalysisStatus);
    return (
        <div style={{ position: 'relative', flexGrow: 1 }}>
            <Box sx={{ height: '4px' }}>{openLoader && <LinearProgress />}</Box>
            <CustomAGGrid
                ref={gridRef}
                rowData={rowsToShow}
                columnDefs={columnsDefs}
                defaultColDef={defaultColDef}
                onGridReady={handleGridReady}
                tooltipShowDelay={TOOLTIP_DELAY}
                overlayNoRowsTemplate={message}
                {...props}
            />
        </div>
    );
};

SensitivityAnalysisResult.defaultProps = {
    result: null,
    nOrNkIndex: 0,
    sensiKind: 0,
};

SensitivityAnalysisResult.propTypes = {
    result: PropTypes.array,
    nOrNkIndex: PropTypes.number,
    sensiKind: PropTypes.string,
    isLoading: PropTypes.bool,
    onFilter: PropTypes.func,
};

export default SensitivityAnalysisResult;
