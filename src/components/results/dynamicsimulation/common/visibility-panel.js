import PropTypes from 'prop-types';

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const getVisibilityStyle = (hidden) => {
    if (hidden) {
        return {
            visibility: 'hidden',
            height: 0,
        };
    }
    return {
        visibility: 'visible',
        height: 'inherit',
    };
};

const VisibilityPanel = ({ children, value, index, ...other }) => {
    return (
        <div style={getVisibilityStyle(value !== index)} {...other}>
            {children}
        </div>
    );
};

VisibilityPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

export default VisibilityPanel;
