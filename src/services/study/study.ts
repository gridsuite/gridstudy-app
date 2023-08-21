// @PathVariable("caseUuid") UUID caseUuid,
// @RequestParam(required = false, value = "studyUuid") UUID studyUuid,
// @RequestParam(required = false, value = "duplicateCase", defaultValue = "false") Boolean duplicateCase,
// @RequestBody(required = false) Map<String, Object> importParameters,
// @RequestHeader(HEADER_USER_ID) String userId

import { UUID } from 'crypto';
import { PREFIX_STUDY_QUERIES } from '.';
import { backendFetch } from '../utils';

interface BasicStudyInfos {
    uniqueId: string;
    id: UUID;
    userId: string;
}

export const recreateStudyFromExistingCase = (
    caseUuid: UUID,
    studyUuid: UUID,
    importParameters: Record<string, any>
): Promise<BasicStudyInfos> => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('caseUuid', caseUuid);

    const recreateStudyUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/network?' +
        urlSearchParams.toString();

    console.debug(recreateStudyUrl);

    return backendFetch(recreateStudyUrl, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importParameters),
    });
};

export const recreateStudy = (studyUuid: UUID): Promise<BasicStudyInfos> => {
    const recreateStudyUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/network';

    console.debug(recreateStudyUrl);

    return backendFetch(recreateStudyUrl, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
    });
};
