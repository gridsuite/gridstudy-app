/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';

const getStyle = (hidden) => {
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

const Visibility = ({ children, value, index, visible = true, ...other }) => {
    return (
        <div style={getStyle(!visible || value !== index)} {...other}>
            {children}
        </div>
    );
};

Visibility.propTypes = {
    children: PropTypes.node,
    value: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    visible: PropTypes.bool,
};

export default Visibility;
