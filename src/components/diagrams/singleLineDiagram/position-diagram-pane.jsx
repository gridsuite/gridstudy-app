/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_LANGUAGE,
    PARAM_USE_NAME,
} from '../../../utils/config-params';
import PositionDiagram from './position-diagram';
import { SLD_DISPLAY_MODE } from '../../network/constants';
import { DiagramType } from '../diagram-common';
import { getVoltageLevelSingleLineDiagram } from '../../../services/study/network';

const PositionDiagramPane = ({ open, onClose, voltageLevelId, currentNodeUuid, studyUuid }) => {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);
    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);
    const componentLibrary = useSelector((state) => state[PARAM_COMPONENT_LIBRARY]);
    const language = useSelector((state) => state[PARAM_LANGUAGE]);

    const [svgUrl, setSvgUrl] = useState(null);
    const handleClose = () => {
        setSvgUrl(null);
        onClose();
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
                SLD_DISPLAY_MODE.FEEDER_POSITION,
                language
            ),
        [studyUuid, currentNodeUuid, voltageLevelId?.id, useName, centerName, diagonalName, componentLibrary, language]
    );

    useEffect(() => {
        if (voltageLevelId?.id !== undefined) {
            if (open) {
                setSvgUrl(getVoltageLevelSingleLineDiagramUrl());
            }
        }
    }, [getVoltageLevelSingleLineDiagramUrl, open, svgUrl, voltageLevelId?.id]);

    return (
        <Dialog onClose={handleClose} open={open} maxWidth="md" scroll="body">
            {voltageLevelId?.id && open && (
                <PositionDiagram
                    onClose={handleClose}
                    diagramTitle={voltageLevelId?.id ?? ''}
                    svgUrl={svgUrl}
                    svgType={DiagramType.VOLTAGE_LEVEL}
                />
            )}
        </Dialog>
    );
};

export default PositionDiagramPane;
