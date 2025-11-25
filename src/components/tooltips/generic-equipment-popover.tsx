import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Popover, Box, Typography, Card, CardHeader, CardContent } from '@mui/material';
import { useSelector } from 'react-redux';
import { RunningStatus } from '../utils/running-status';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { fetchNetworkElementInfos } from '../../services/study/network';
import { EquipmentInfos, EquipmentType, MuiStyles, useDebounce } from '@gridsuite/commons-ui';
import { AppState } from 'redux/reducer';
import { UUID } from 'node:crypto';

interface MenuAnchorPosition {
    top: number;
    left: number;
}

interface GenericEquipmentPopoverProps {
    studyUuid: UUID | null;
    anchorEl?: HTMLElement | null;
    anchorPosition?: MenuAnchorPosition | null;
    equipmentId?: string;
    equipmentType?: EquipmentType;
    loadFlowStatus?: RunningStatus;
    children?: (equipmentInfos: EquipmentInfos) => ReactNode;
}

const GenericEquipmentPopover: React.FC<GenericEquipmentPopoverProps> = ({
    studyUuid,
    anchorEl,
    anchorPosition,
    equipmentId,
    equipmentType,
    children,
}) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const [localAnchorEl, setLocalAnchorEl] = useState<HTMLElement | null>(null);
    const [localAnchorPosition, setLocalAnchorPosition] = useState<MenuAnchorPosition | null>(null);
    const [equipmentInfos, setEquipmentInfo] = useState<EquipmentInfos | null>(null);

    const getNetworkElementInfos = useCallback(
        (
            equipmentId: string,
            equipmentType: EquipmentType,
            currentRootNetworkUuid: UUID,
            currentNodeId: UUID,
            studyUuid: UUID
        ) => {
            fetchNetworkElementInfos(
                studyUuid,
                currentNodeId,
                currentRootNetworkUuid,
                equipmentType,
                EQUIPMENT_INFOS_TYPES.TOOLTIP.type,
                equipmentId,
                true
            ).then((value) => {
                setEquipmentInfo(value);
                if (anchorPosition) {
                    setLocalAnchorPosition(anchorPosition);
                    setLocalAnchorEl(null);
                }
                if (anchorEl && document.contains(anchorEl)) {
                    setLocalAnchorEl(anchorEl);
                    setLocalAnchorPosition(null);
                } else {
                    setLocalAnchorEl(null);
                }
            });
        },
        [anchorEl, anchorPosition]
    );

    const debouncedNetworkElementInfos = useDebounce(getNetworkElementInfos, 200);

    useEffect(() => {
        if (currentRootNetworkUuid && currentNode && studyUuid && equipmentId && equipmentId !== '') {
            debouncedNetworkElementInfos(
                equipmentId,
                equipmentType!,
                currentRootNetworkUuid,
                currentNode.id,
                studyUuid
            );
        } else {
            setEquipmentInfo(null);
        }
    }, [
        debouncedNetworkElementInfos,
        equipmentId,
        equipmentType,
        currentNode?.id,
        studyUuid,
        currentRootNetworkUuid,
        currentNode,
    ]);

    const handlePopoverClose = () => setEquipmentInfo(null);

    const anchorProps = localAnchorPosition
        ? { anchorReference: 'anchorPosition' as const, anchorPosition: localAnchorPosition }
        : {
              anchorEl: localAnchorEl,
              anchorOrigin: { vertical: 'bottom' as const, horizontal: 'left' as const },
              transformOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
          };

    return localAnchorEl || localAnchorPosition ? (
        <Popover
            {...anchorProps}
            open={Boolean(localAnchorEl || localAnchorPosition)}
            onClose={handlePopoverClose}
            disableRestoreFocus
            sx={{ pointerEvents: 'none' }}
        >
            {equipmentInfos && (
                <Card elevation={0}>
                    <CardHeader
                        sx={{ textAlign: 'center' }}
                        title={
                            <Typography variant="caption" fontWeight="bold" textAlign="center">
                                {equipmentId}
                            </Typography>
                        }
                    />

                    <CardContent>{children && children(equipmentInfos)}</CardContent>
                </Card>
            )}
        </Popover>
    ) : null;
};

export default GenericEquipmentPopover;
