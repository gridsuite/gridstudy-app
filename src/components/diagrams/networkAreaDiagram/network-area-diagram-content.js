/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { RunningStatus } from '../../util/running-status';
import makeStyles from '@mui/styles/makeStyles';
import { commonDiagramStyle, commonNadStyle } from '../diagram-common';

const useStyles = makeStyles((theme) => ({
    divNad: commonNadStyle(theme),
    ...commonDiagramStyle(theme),
}));

const NetworkAreaDiagramContent = forwardRef((props, ref) => {
    const classes = useStyles();

    const { loadFlowStatus } = props;

    return (
        <div
            id="nad-svg"
            ref={ref}
            className={clsx(classes.divNad, {
                [classes.divInvalid]: loadFlowStatus !== RunningStatus.SUCCEED,
            })}
            style={{ height: '100%' }}
        />
    );
});

NetworkAreaDiagramContent.propTypes = {
    loadFlowStatus: PropTypes.any,
};

export default NetworkAreaDiagramContent;
