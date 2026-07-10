import { UUID } from 'node:crypto';

export interface DirectoryInfos {
    uuid: UUID;
    isRoot: boolean;
}

export const DIRECTORIES_INFOS = 'directoriesInfos';
