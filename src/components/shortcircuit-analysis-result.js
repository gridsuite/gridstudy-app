/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import VirtualizedTable from './util/virtualized-table';

const ShortCircuitAnalysisResult = ({ result }) => {
    const intl = useIntl();

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);

    function flattenResult(shortcutAnalysisResult) {
        const rows = [];
        shortcutAnalysisResult?.faults?.forEach((f) => {
            const fault = f.fault;
            const limitViolations = f.limitViolations;
            let firstLimitViolation;
            if (limitViolations.length > 0) {
                let lv = limitViolations[0];
                firstLimitViolation = {
                    limitType: intl.formatMessage({
                        id: lv.limitType,
                    }),
                    limitMin:
                        lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT'
                            ? lv.limit
                            : NaN,
                    limitMax:
                        lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT'
                            ? lv.limit
                            : NaN,
                    limitName: lv.limitName,
                    current: lv.value,
                };
            }
            rows.push({
                faultId: fault.id,
                elementId: fault.elementId,
                faultType: intl.formatMessage({ id: fault.faultType }),
                shortCircuitPower: f.shortCircuitPower,
                current: f.current,
                ...firstLimitViolation,
            });
            limitViolations.slice(1).forEach((lv) => {
                rows.push({
                    limitType: intl.formatMessage({
                        id: lv.limitType,
                    }),
                    limitMin:
                        lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT'
                            ? lv.limit
                            : NaN,
                    limitMax:
                        lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT'
                            ? lv.limit
                            : NaN,
                    limitName: lv.limitName,
                    current: lv.value,
                });
            });
            const feederResults = f.feederResults;
            feederResults.forEach((fr) => {
                rows.push({
                    connectableId: fr.connectableId,
                    current: fr.current,
                });
            });
        });
        return rows;
    }

    function renderResult() {
        const rows = flattenResult(result);
        return (
            result &&
            shortCircuitNotif && (
                <div
                    style={{
                        flexGrow: 1,
                        /* autosizer (used in virtual table) can return wrong size
                  (off by 1) and it causes scrollbar to blink
                  * */
                        overflow: 'hidden',
                    }}
                >
                    <VirtualizedTable
                        rows={rows}
                        sortable={false}
                        columns={[
                            {
                                width: 200,
                                label: intl.formatMessage({ id: 'IDNode' }),
                                dataKey: 'elementId',
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({ id: 'Type' }),
                                dataKey: 'faultType',
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({ id: 'Feeders' }),
                                dataKey: 'connectableId',
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({ id: 'IscKA' }),
                                dataKey: 'current',
                                numeric: true,
                                fractionDigits: 1,
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({ id: 'LimitType' }),
                                dataKey: 'limitType',
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({ id: 'IscMinKA' }),
                                dataKey: 'limitMin',
                                numeric: true,
                                nullable: true,
                                fractionDigits: 1,
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({ id: 'IscMaxKA' }),
                                dataKey: 'limitMax',
                                numeric: true,
                                nullable: true,
                                fractionDigits: 1,
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({ id: 'PscMVA' }),
                                dataKey: 'shortCircuitPower',
                                numeric: true,
                                fractionDigits: 1,
                            },
                        ]}
                    />
                </div>
            )
        );
    }

    return renderResult();
};

ShortCircuitAnalysisResult.defaultProps = {
    result: null,
};

ShortCircuitAnalysisResult.propTypes = {
    result: PropTypes.object,
};

export default ShortCircuitAnalysisResult;
