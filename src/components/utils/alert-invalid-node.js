/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Alert from '@mui/material/Alert';
import { FormattedMessage } from 'react-intl';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
    invalidNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
}));

const AlertInvalidNode = (props) => {
    const classes = useStyles();

    return (
        <Alert
            className={clsx({ [classes.invalidNode]: !props.noMargin })}
            severity="warning"
        >
            <FormattedMessage id="InvalidNode" />
        </Alert>
    );
};

AlertInvalidNode.defaultProps = {
    noMargin: false,
};

AlertInvalidNode.propTypes = {
    noMargin: PropTypes.bool,
};

export default AlertInvalidNode;
