import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../../../redux/reducer';

/*export interface LccModificationFormProps {
    studyUuid: UUID;
    editData?: LccCreationInfos;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    batteryToModify: LccFormInfos | null;
    updatePreviousReactiveCapabilityCurveTable: (action: string, index: number) => void;
    equipmentId: string;
    isUpdate: boolean;
    editDataFetchStatus?: FetchStatus;
}*/

interface LccModificationFormProps {
    tabIndex: number;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

export function LccModificationForm(props: LccModificationFormProps) {
    return <></>;
}
