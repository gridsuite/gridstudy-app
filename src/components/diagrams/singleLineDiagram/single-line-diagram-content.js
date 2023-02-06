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
import { equipments } from '../../network/network-equipments';
import makeStyles from '@mui/styles/makeStyles';
import { commonDiagramStyle, commonSldStyle } from '../diagram-common';

const useStyles = makeStyles((theme) => ({
    ...commonDiagramStyle(theme),
    divSld: {
        ...commonSldStyle(theme),
    },
}));

const SingleLineDiagramContent = forwardRef((props, ref) => {
    const classes = useStyles();

    const { loadFlowStatus, svg, displayBranchMenu, displayMenu } = props;

    return (
        <>
            <div
                ref={ref}
                className={clsx(classes.divSld, {
                    [classes.divInvalid]:
                        loadFlowStatus !== RunningStatus.SUCCEED,
                })}
                dangerouslySetInnerHTML={{
                    __html: svg.svg,
                }}
                style={{ height: '100%' }}
            />
            {displayBranchMenu()}
            {displayMenu(equipments.loads, 'load-menus')}
            {displayMenu(equipments.batteries, 'battery-menus')}
            {displayMenu(equipments.danglingLines, 'dangling-line-menus')}
            {displayMenu(equipments.generators, 'generator-menus')}
            {displayMenu(
                equipments.staticVarCompensators,
                'static-var-compensator-menus'
            )}
            {displayMenu(
                equipments.shuntCompensators,
                'shunt-compensator-menus'
            )}
            {displayMenu(
                equipments.threeWindingsTransformers,
                'three-windings-transformer-menus'
            )}
            {displayMenu(equipments.hvdcLines, 'hvdc-line-menus')}
            {displayMenu(
                equipments.lccConverterStations,
                'lcc-converter-station-menus'
            )}
            {displayMenu(
                equipments.vscConverterStations,
                'vsc-converter-station-menus'
            )}
        </>
    );
});

SingleLineDiagramContent.propTypes = {
    svg: PropTypes.any,
    loadFlowStatus: PropTypes.any,
    displayBranchMenu: PropTypes.func,
    displayMenu: PropTypes.func,
};

export default SingleLineDiagramContent;
