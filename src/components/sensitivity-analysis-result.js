/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
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

const SensitivityAnalysisResult = ({ result }) => {
    const selectedTheme = useSelector((state) => state[PARAM_THEME]);

    const sensiNotif = useSelector((state) => state.sensiNotif);

    function renderResult() {
        return (
            result &&
            sensiNotif && (
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

SensitivityAnalysisResult.defaultProps = {
    result: null,
};

SensitivityAnalysisResult.propTypes = {
    result: PropTypes.object,
};

export default SensitivityAnalysisResult;
