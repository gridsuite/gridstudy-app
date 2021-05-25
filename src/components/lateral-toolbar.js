/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import List from '@material-ui/core/List';
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from 'prop-types';

const LateralToolbar = (props) => {
    return (
        <List>
            <IconButton onClick={props.handleDisplayVoltageLevel}>
                <LinearScaleIcon />
            </IconButton>
            <IconButton disabled={true}>
                <AccountTreeIcon />
            </IconButton>
        </List>
    );
};

LateralToolbar.propTypes = {
    handleDisplayVoltageLevel: PropTypes.func,
};

export default LateralToolbar;
