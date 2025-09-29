/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PARAM_LANGUAGE, PARAM_USE_NAME } from '../../../../../../utils/config-params';
import PositionDiagram from './position-diagram';
import { SLD_DISPLAY_MODE } from '../../../../../network/constants';
import { getVoltageLevelSingleLineDiagram } from '../../../../../../services/study/network';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import { DiagramType } from '../../diagram.type';

interface PositionDiagramPaneProps {
    open: boolean;
    onClose: () => void;
    voltageLevelId: string;
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
    const voltageLevelSingleLineDiagramUrl = useMemo(() => {
        if (!voltageLevelId) {
            return '';
        }
        return getVoltageLevelSingleLineDiagram({
            studyUuid: studyUuid,
            currentNodeUuid: currentNodeUuid,
            currentRootNetworkUuid: currentRootNetworkUuid,
            voltageLevelId: voltageLevelId,
            useName: useName,
            centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
            diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
            componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
            sldDisplayMode: SLD_DISPLAY_MODE.FEEDER_POSITION,
            language: language,
        });
    }, [
        voltageLevelId,
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        useName,
        networkVisuParams.singleLineDiagramParameters.centerLabel,
        networkVisuParams.singleLineDiagramParameters.diagonalLabel,
        networkVisuParams.singleLineDiagramParameters.componentLibrary,
        language,
    ]);

    return (
        <Dialog onClose={onClose} open={open} maxWidth="md" scroll="body">
            {voltageLevelId && open && (
                <PositionDiagram
                    onClose={onClose}
                    diagramTitle={voltageLevelId}
                    svgUrl={voltageLevelSingleLineDiagramUrl}
                    svgType={DiagramType.VOLTAGE_LEVEL}
                />
            )}
        </Dialog>
    );
};

export default PositionDiagramPane;
