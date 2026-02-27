/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../../../../../utils/config-params';
import PositionDiagram from './position-diagram';
import { SLD_DISPLAY_MODE } from '../../../../../network/constants';
import { getVoltageLevelSingleLineDiagramUrl } from '../../../../../../services/study/network';
import { AppState } from 'redux/reducer.type';
import type { UUID } from 'node:crypto';
import { DiagramType } from '../../diagram.type';
import { PARAM_LANGUAGE } from '@gridsuite/commons-ui';

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
        return getVoltageLevelSingleLineDiagramUrl({
            studyUuid: studyUuid,
            currentNodeUuid: currentNodeUuid,
            currentRootNetworkUuid: currentRootNetworkUuid,
            voltageLevelId: voltageLevelId,
        });
    }, [voltageLevelId, studyUuid, currentNodeUuid, currentRootNetworkUuid]);
    const sldRequestInfos = {
        useName: useName,
        centerLabel: networkVisuParams?.singleLineDiagramParameters.centerLabel,
        diagonalLabel: networkVisuParams?.singleLineDiagramParameters.diagonalLabel,
        componentLibrary: networkVisuParams?.singleLineDiagramParameters.componentLibrary,
        sldDisplayMode: SLD_DISPLAY_MODE.FEEDER_POSITION,
        topologicalColoring: true,
        language: language,
    };
    const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sldRequestInfos),
    };

    return (
        <Dialog onClose={onClose} open={open} maxWidth="md" scroll="body">
            {voltageLevelId && open && (
                <PositionDiagram
                    onClose={onClose}
                    diagramTitle={voltageLevelId}
                    svgUrl={voltageLevelSingleLineDiagramUrl}
                    svgType={DiagramType.VOLTAGE_LEVEL}
                    fetchOptions={fetchOptions}
                />
            )}
        </Dialog>
    );
};

export default PositionDiagramPane;
