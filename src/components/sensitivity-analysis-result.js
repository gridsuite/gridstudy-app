/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import VirtualizedTable from './utils/virtualized-table';
import { useMemo } from 'react';

function makeColumn(isNum, labelId, key, intl) {
    return {
        label: intl.formatMessage({ id: labelId }),
        dataKey: key,
        numeric: isNum,
        fractionDigits: isNum ? 4 : undefined,
    };
}

function makeColumns(nOrNkIndex, functionTypeIndex, intl) {
    const ret = [];
    const labelId = functionTypeIndex < 2 ? 'SupervisedBranches' : 'BusBarBus';
    ret.push(makeColumn(false, labelId, 'funcId', intl));
    ret.push(makeColumn(false, 'VariablesToSimulate', 'varId', intl));

    if (nOrNkIndex === 1) {
        ret.push(makeColumn(false, 'ContingencyId', 'contingencyId', intl));
    }

    let suffix1 = 'In' + ['kW', 'kA', 'kV'][functionTypeIndex];
    let suffix = suffix1 + (nOrNkIndex !== 1 ? '' : 'BeforeContingency');
    ret.push(makeColumn(true, 'ValRef' + suffix, 'functionReference', intl));
    ret.push(makeColumn(true, 'Delta' + suffix, 'value', intl));

    if (nOrNkIndex === 1) {
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

const SensitivityAnalysisResult = ({
    result,
    nOrNkIndex,
    sensiToIndex,
    indexer,
}) => {
    const intl = useIntl();

    let columns = useMemo(
        () => makeColumns(nOrNkIndex, sensiToIndex, intl),
        [nOrNkIndex, sensiToIndex, intl]
    );
    let rows = useMemo(
        () => makeRows(result, nOrNkIndex, sensiToIndex),
        [result, nOrNkIndex, sensiToIndex]
    );

    return (
        <div style={{ flexGrow: 1 }}>
            <VirtualizedTable
                name="Nom"
                rows={rows}
                columns={columns}
                indexer={indexer}
                sortable={true}
                defersFilterChanges
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
};

export default SensitivityAnalysisResult;
