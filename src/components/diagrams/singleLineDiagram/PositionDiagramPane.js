/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import { Alert } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { getVoltageLevelSingleLineDiagram } from '../../../utils/rest-api';
import { useSelector } from 'react-redux';
import {
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_USE_NAME,
} from '../../../utils/config-params';
import PositionDiagram from './PositionDiagram';
import { SvgType } from './single-line-diagram';
import { AutoSizer } from 'react-virtualized';
import { useIntl } from 'react-intl';

const PositionDiagramPane = ({
    open,
    onClose,
    voltageLevelId,
    currentNodeUuid,
    studyUuid,
}) => {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);
    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);
    const componentLibrary = useSelector(
        (state) => state[PARAM_COMPONENT_LIBRARY]
    );
    const [enableSld, setEnableSld] = useState(false);

    const [svgUrl, setSvgUrl] = useState(null);
    const intl = useIntl();
    const handleClose = () => {
        onClose();
        setEnableSld(false);
        setSvgUrl(null);
    };

    const getVoltageLevelSingleLineDiagramUrl = useCallback(
        () =>
            getVoltageLevelSingleLineDiagram(
                studyUuid,
                currentNodeUuid,
                voltageLevelId?.id,
                useName,
                centerName,
                diagonalName,
                componentLibrary,
                true
            ),
        [
            studyUuid,
            currentNodeUuid,
            voltageLevelId?.id,
            useName,
            centerName,
            diagonalName,
            componentLibrary,
        ]
    );

    useEffect(() => {
        if (voltageLevelId?.id !== undefined) {
            setEnableSld(true);
            setSvgUrl(getVoltageLevelSingleLineDiagramUrl());
        } else {
            setEnableSld(false);
        }
    }, [getVoltageLevelSingleLineDiagramUrl, svgUrl, voltageLevelId]);

    return (
        <AutoSizer>
            {(width, height) => (
                <Dialog
                    onClose={handleClose}
                    open={open}
                    maxWidth
                    scroll="body"
                >
                    {!voltageLevelId?.id && (
                        <Alert severity="error">
                            {intl.formatMessage({
                                id: 'ErrorNoVoltageSelected',
                            })}
                        </Alert>
                    )}

                    {enableSld && (
                        <PositionDiagram
                            onClose={handleClose}
                            diagramTitle={voltageLevelId?.id ?? ''}
                            svgUrl={svgUrl}
                            svgType={SvgType.VOLTAGE_LEVEL}
                            isComputationRunning={false}
                            totalWidth={width}
                            totalHeight={height}
                        />
                    )}
                </Dialog>
            )}
        </AutoSizer>
    );
};

export default PositionDiagramPane;
