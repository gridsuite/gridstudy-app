import { UUID } from 'crypto';

export interface ReduxState {
    studyUpdated: StudyUpdated;
}

export interface StudyUpdatedEventDataHeader {
    studyUuid: UUID;
    parentNode: UUID;
    timestamp: number;
    updateType?: string;
    node?: UUID;
    nodes?: UUID[];
    error?: string;
    userId?: string;
}

export interface StudyUpdatedEventData {
    headers: StudyUpdatedEventDataHeader;
    payload: string;
}

export interface StudyUpdated {
    force: 0 | 1;
    eventData: StudyUpdatedEventData;
}
