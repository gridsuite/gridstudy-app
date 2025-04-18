/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, MouseEvent as ReactMouseEvent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { equipmentStyles, TagRenderer, TagRendererProps } from '@gridsuite/commons-ui';
import { IconButton } from '@mui/material';
import { GpsFixed as GpsFixedIcon, Timeline as TimelineIcon } from '@mui/icons-material';
import { NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS } from '../diagrams/diagram-common';
import { EQUIPMENT_TYPES } from '../utils/equipment-types';
import { centerOnSubstation, openDiagram } from '../../redux/actions';
import { AppState } from '../../redux/reducer';
import { AppDispatch } from '../../redux/store';
import { fetchSubstationIdForVoltageLevel } from 'services/study/network';
import { DiagramType } from '../diagrams/diagram.type';

interface CustomSuffixRendererProps extends TagRendererProps {
    onClose?: () => void;
}

export const CustomSuffixRenderer: FunctionComponent<CustomSuffixRendererProps> = ({
    element,
    onClose,
    ...tagRendererProps
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const networkAreaDiagramNbVoltageLevels = useSelector((state: AppState) => state.networkAreaDiagramNbVoltageLevels);
    const networkAreaDiagramDepth = useSelector((state: AppState) => state.networkAreaDiagramDepth);

    const centerOnSubstationCB = useCallback(
        (e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            if (!studyUuid || !currentNode || !currentRootNetworkUuid) {
                return;
            }
            let substationIdPromise;
            // @ts-expect-error: conflicts between commons-ui's EquipmentType and gridstudy's EQUIPMENT_TYPE
            if (element.type === EQUIPMENT_TYPES.SUBSTATION) {
                substationIdPromise = Promise.resolve(element.id);
            } else {
                substationIdPromise = fetchSubstationIdForVoltageLevel(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    element.id
                );
            }
            substationIdPromise.then((substationId) => {
                dispatch(centerOnSubstation(substationId));
                onClose?.();
                e.stopPropagation();
            });
        },
        [studyUuid, currentNode, currentRootNetworkUuid, element.type, element.id, dispatch, onClose]
    );

    const openNetworkAreaDiagramCB = useCallback(
        (e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
            dispatch(openDiagram(element.id, DiagramType.NETWORK_AREA_DIAGRAM));
            onClose?.();
            e.stopPropagation();
        },
        [dispatch, element.id, onClose]
    );

    if (
        // @ts-expect-error: conflicts between commons-ui's EquipmentType and gridstudy's EQUIPMENT_TYPE
        element.type === EQUIPMENT_TYPES.SUBSTATION ||
        // @ts-expect-error: conflicts between commons-ui's EquipmentType and gridstudy's EQUIPMENT_TYPE
        element.type === EQUIPMENT_TYPES.VOLTAGE_LEVEL
    ) {
        return (
            <>
                {element.type === EQUIPMENT_TYPES.VOLTAGE_LEVEL && (
                    <IconButton
                        disabled={
                            networkAreaDiagramNbVoltageLevels > NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS &&
                            networkAreaDiagramDepth !== 0
                        }
                        onClick={openNetworkAreaDiagramCB}
                        size="small"
                    >
                        <TimelineIcon fontSize="small" />
                    </IconButton>
                )}
                <IconButton
                    disabled={(!studyUuid || !currentNode) && element.type !== EQUIPMENT_TYPES.SUBSTATION}
                    onClick={centerOnSubstationCB}
                    size="small"
                >
                    <GpsFixedIcon fontSize="small" />
                </IconButton>
            </>
        );
    } else {
        return <TagRenderer {...tagRendererProps} element={element} styles={equipmentStyles} />;
    }
};
