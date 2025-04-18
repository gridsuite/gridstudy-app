/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PARAM_LANGUAGE, PARAM_USE_NAME } from '../../../utils/config-params';
import PositionDiagram from './position-diagram';
import { SLD_DISPLAY_MODE } from '../../network/constants';
import { getVoltageLevelSingleLineDiagram } from '../../../services/study/network';
import { FC } from 'react';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import { DiagramType } from '../diagram.type';

interface PositionDiagramPaneProps {
    open: boolean;
    onClose: () => void;
    voltageLevelId?: { id: UUID };
    currentNodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
}

const PositionDiagramPane: FC<PositionDiagramPaneProps> = ({
    open,
    onClose,
    voltageLevelId,
    currentNodeUuid,
    currentRootNetworkUuid,
    studyUuid,
}) => {
    const useName = useSelector((state: AppState) => state[PARAM_USE_NAME]);
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);

    const [svgUrl, setSvgUrl] = useState<string | null>(null);
    const handleClose = () => {
        setSvgUrl(null);
        onClose();
    };

    const getVoltageLevelSingleLineDiagramUrl = useCallback(
        () =>
            getVoltageLevelSingleLineDiagram({
                studyUuid: studyUuid,
                currentNodeUuid: currentNodeUuid,
                currentRootNetworkUuid: currentRootNetworkUuid,
                voltageLevelId: voltageLevelId?.id,
                useName: useName,
                centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                sldDisplayMode: SLD_DISPLAY_MODE.FEEDER_POSITION,
                language: language,
            }),
        [
            studyUuid,
            currentNodeUuid,
            currentRootNetworkUuid,
            voltageLevelId?.id,
            useName,
            networkVisuParams.singleLineDiagramParameters.centerLabel,
            networkVisuParams.singleLineDiagramParameters.diagonalLabel,
            networkVisuParams.singleLineDiagramParameters.componentLibrary,
            language,
        ]
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
