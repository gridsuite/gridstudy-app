import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import BranchPopoverContent from './branch-popover-content';

export const EquipmentPopoverMap: Record<string, React.FC<any>> = {
    [(EQUIPMENT_TYPES.LINE, EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER)]: BranchPopoverContent,
};
