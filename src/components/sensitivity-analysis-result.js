/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import VirtualizedTable from './util/virtualized-table';
import { useMemo } from 'react';

function makeColumn(isNum, labelId, key, intl) {
    return {
        width: 200,
        label: intl.formatMessage({ id: labelId }),
        dataKey: key,
        numeric: isNum,
    };
}

function makeColumns(nOrNkIndex, functionTypeIndex, intl) {
    const ret = [];
    const labelId = functionTypeIndex < 2 ? 'SupervisedBranches' : 'BusBarBus';
    ret.push(makeColumn(false, labelId, 'funcId', intl));
    ret.push(makeColumn(false, 'VariablesToSimulate', 'varId', intl));

    if (nOrNkIndex === 2) {
        ret.push(makeColumn(false, 'ContingencyId', 'contingencyId', intl));
    }

    let suffix1 = 'In' + ['kW', 'kA', 'kV'][functionTypeIndex];
    let suffix = suffix1 + (nOrNkIndex !== 2 ? '' : 'BeforeContingency');
    ret.push(makeColumn(true, 'ValRef' + suffix, 'functionReference', intl));
    ret.push(makeColumn(true, 'Delta' + suffix, 'value', intl));

    if (nOrNkIndex === 2) {
        ret.push(
            makeColumn(true, 'ValRef' + suffix1, 'functionReferenceAfter', intl)
        );
        ret.push(makeColumn(true, 'Delta' + suffix1, 'valueAfter', intl));
    }

    return ret;
}

function makeRows(resultRecord, nOrNkIndex, sensiToIndex) {
    return resultRecord;
}

const SensitivityAnalysisResult = ({ result, nOrNkIndex, sensiToIndex }) => {
    console.log('SensitivityAnalysisResult', nOrNkIndex, sensiToIndex);

    const intl = useIntl();

    const sensiNotif = useSelector((state) => state.sensiNotif);

    let columns = useMemo(
        () => makeColumns(nOrNkIndex, sensiToIndex, intl),
        [nOrNkIndex, sensiToIndex, intl]
    );
    let rows = useMemo(
        () => makeRows(result, nOrNkIndex, sensiToIndex),
        [result, nOrNkIndex, sensiToIndex]
    );

    console.log(
        'col,row',
        sensiNotif,
        rows.length,
        columns,
        result,
        Array.isArray(rows) && sensiNotif
    );

    return (
        <div style={{ flexGrow: 1 }}>
            <VirtualizedTable sortable={true} rows={rows} columns={columns} />)
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
};

export default SensitivityAnalysisResult;
