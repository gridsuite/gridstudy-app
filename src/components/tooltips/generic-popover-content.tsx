import { EquipmentInfos, EquipmentType } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { EquipmentPopoverMap } from './equipment-popover-map';
import RunningStatus from 'components/utils/running-status';

interface GenericPopoverContentProps {
    equipmentType?: EquipmentType | string;
    equipmentInfos: any;
    loadFlowStatus?: RunningStatus;
}

export const GenericPopoverContent: React.FC<GenericPopoverContentProps> = ({
    equipmentType,
    equipmentInfos,
    loadFlowStatus,
}) => {
    const intl = useIntl();

    if (!equipmentType) return null;

    const PopoverComponent = EquipmentPopoverMap[equipmentType];
    if (!PopoverComponent) return null;

    return (
        <PopoverComponent
            equipmentType={equipmentType}
            equipmentInfos={equipmentInfos}
            loadFlowStatus={loadFlowStatus}
            intl={intl}
        />
    );
};
