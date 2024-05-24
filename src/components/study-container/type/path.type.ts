import { UUID } from 'crypto';

export type PathType = {
    elementUuid: UUID;
    elementName: string;
    type: string;
    accessRights: unknown;
    owner: string;
    subdirectoriesCount: number;
    description: string;
    creationDate: Date;
    lastModificationDate: Date;
    lastModifiedBy: string;
};
