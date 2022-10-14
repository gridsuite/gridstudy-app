/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import PropTypes from 'prop-types';
import ReactJson from 'react-json-view';
import { useSelector } from 'react-redux';
import { PARAM_THEME } from '../utils/config-params';
import { LIGHT_THEME } from '@gridsuite/commons-ui';

const ShortCircuitAnalysisResult = ({ result }) => {
    const selectedTheme = useSelector((state) => state[PARAM_THEME]);

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);

    function renderResult() {
        return (
            result &&
            shortCircuitNotif && (
                <ReactJson
                    src={result}
                    onEdit={false}
                    onAdd={false}
                    onDelete={false}
                    theme={
                        selectedTheme === LIGHT_THEME
                            ? 'rjv-default'
                            : 'monokai'
                    }
                />
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
