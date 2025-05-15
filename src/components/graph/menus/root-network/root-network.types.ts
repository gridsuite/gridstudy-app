import { UUID } from 'crypto';

export interface BasicNodeInfos {
    nodeUuid: UUID;
    name: string;
}

export interface Modification {
    modificationUuid: UUID;
    messageValues: string;
}

export interface ModificationsSearchResult {
    basicNodeInfos: BasicNodeInfos;
    modifications: Modification[];
}
