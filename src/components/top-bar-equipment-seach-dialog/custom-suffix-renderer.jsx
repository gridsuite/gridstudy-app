import { TagRenderer, equipmentStyles } from '@gridsuite/commons-ui';
import { IconButton } from '@mui/material';
import {
    DiagramType,
    NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS,
} from 'components/diagrams/diagram-common';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from 'components/utils/equipment-types';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { centerOnSubstation, openDiagram } from 'redux/actions';
import { fetchNetworkElementInfos } from 'services/study/network';
import {
    GpsFixed as GpsFixedIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';

export const CustomSuffixRenderer = ({ props, element }) => {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const networkAreaDiagramNbVoltageLevels = useSelector(
        (state) => state.networkAreaDiagramNbVoltageLevels
    );
    const networkAreaDiagramDepth = useSelector(
        (state) => state.networkAreaDiagramDepth
    );

    const centerOnSubstationCB = useCallback(
        (e, element) => {
            e.stopPropagation();
            if (!studyUuid || !currentNode) {
                return;
            }
            let substationIdPromise;
            if (element.type === EQUIPMENT_TYPES.SUBSTATION) {
                substationIdPromise = Promise.resolve(element.id);
            } else {
                substationIdPromise = fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
                    EQUIPMENT_INFOS_TYPES.LIST.type,
                    element.id,
                    true
                ).then((vl) => vl.substationId);
            }
            substationIdPromise.then((substationId) => {
                dispatch(centerOnSubstation(substationId));
                props.onClose && props.onClose();
                e.stopPropagation();
            });
        },
        [dispatch, props, studyUuid, currentNode]
    );

    const openNetworkAreaDiagramCB = useCallback(
        (e, element) => {
            dispatch(openDiagram(element.id, DiagramType.NETWORK_AREA_DIAGRAM));
            props.onClose && props.onClose();
            e.stopPropagation();
        },
        [dispatch, props]
    );

    if (
        element.type === EQUIPMENT_TYPES.SUBSTATION ||
        element.type === EQUIPMENT_TYPES.VOLTAGE_LEVEL
    ) {
        return (
            <>
                {element.type === EQUIPMENT_TYPES.VOLTAGE_LEVEL && (
                    <IconButton
                        disabled={
                            networkAreaDiagramNbVoltageLevels >
                                NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS &&
                            networkAreaDiagramDepth !== 0
                        }
                        onClick={(e) => openNetworkAreaDiagramCB(e, element)}
                        size={'small'}
                    >
                        <TimelineIcon fontSize={'small'} />
                    </IconButton>
                )}
                <IconButton
                    disabled={
                        (!studyUuid || !currentNode) &&
                        element.type !== EQUIPMENT_TYPES.SUBSTATION
                    }
                    onClick={(e) => centerOnSubstationCB(e, element)}
                    size={'small'}
                >
                    <GpsFixedIcon fontSize={'small'} />
                </IconButton>
            </>
        );
    } else {
        return (
            <TagRenderer
                styles={equipmentStyles}
                props={props}
                element={element}
            />
        );
    }
};
