import { TemporaryLimit } from '../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../redux/reducer';

export interface ILimitColumnDef {
    label: string;
    dataKey: string;
    initialValue: string | null;
    editable: boolean;
    numeric: boolean;
    width?: number;
    maxWidth?: number;
    showErrorMsg?: boolean;
}

export interface LimitsSidePaneProps {
    limitsGroupFormName: string;
    permanentCurrentLimitPreviousValue: number | null | undefined;
    temporaryLimitsPreviousValues: TemporaryLimit[];
    clearableFields: boolean | undefined;
    currentNode?: CurrentTreeNode;
    onlySelectedLimitsGroup: boolean;
}
