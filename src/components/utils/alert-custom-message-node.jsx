/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Alert from '@mui/material/Alert';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { mergeSx } from './functions';

const styles = {
    customMessageNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
};

const AlertCustomMessageNode = (props) => {
    const { noMargin, message } = props;

    return (
        <Alert sx={mergeSx(!noMargin && styles.customMessageNode)} severity="warning">
            <FormattedMessage id={message} />
        </Alert>
    );
};

AlertCustomMessageNode.defaultProps = {
    noMargin: false,
    message: '',
};

AlertCustomMessageNode.propTypes = {
    noMargin: PropTypes.bool,
    message: PropTypes.string,
};

export default AlertCustomMessageNode;
