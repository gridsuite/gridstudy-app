/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, MouseEvent as ReactMouseEvent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { equipmentStyles, EquipmentType, TagRenderer, TagRendererProps } from '@gridsuite/commons-ui';
import { IconButton } from '@mui/material';
import { GpsFixed as GpsFixedIcon, Timeline as TimelineIcon } from '@mui/icons-material';
import { centerOnSubstation } from '../../redux/actions';
import { AppState } from '../../redux/reducer.type';
import { AppDispatch } from '../../redux/store';
import { fetchSubstationIdForVoltageLevel } from 'services/study/network';
import { useWorkspacePanelActions } from '../workspace/hooks/use-workspace-panel-actions';

interface CustomSuffixRendererProps extends TagRendererProps {
    onClose?: () => void;
    disablCenterSubstation: boolean;
}

export const CustomSuffixRenderer: FunctionComponent<CustomSuffixRendererProps> = ({
    element,
    onClose,
    disablCenterSubstation,
    ...tagRendererProps
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const { openNAD } = useWorkspacePanelActions();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const centerOnSubstationCB = useCallback(
        (e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            if (!studyUuid || !currentNode || !currentRootNetworkUuid) {
                return;
            }
            let substationIdPromise;
            if (element.type === EquipmentType.SUBSTATION) {
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
            e.stopPropagation();
            onClose?.();
            openNAD({ title: element.id, initialVoltageLevelIds: [element.id] });
        },
        [openNAD, element.id, onClose]
    );

    if (element.type === EquipmentType.SUBSTATION || element.type === EquipmentType.VOLTAGE_LEVEL) {
        return (
            <>
                {element.type === EquipmentType.VOLTAGE_LEVEL && (
                    <IconButton onClick={openNetworkAreaDiagramCB} size="small">
                        <TimelineIcon fontSize="small" />
                    </IconButton>
                )}
                {!disablCenterSubstation && (
                    <IconButton
                        disabled={(!studyUuid || !currentNode) && element.type !== EquipmentType.SUBSTATION}
                        onClick={centerOnSubstationCB}
                        size="small"
                    >
                        <GpsFixedIcon fontSize="small" />
                    </IconButton>
                )}
            </>
        );
    } else {
        return <TagRenderer {...tagRendererProps} element={element} styles={equipmentStyles} />;
    }
};
