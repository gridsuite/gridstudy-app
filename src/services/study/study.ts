// @PathVariable("caseUuid") UUID caseUuid,
// @RequestParam(required = false, value = "studyUuid") UUID studyUuid,
// @RequestParam(required = false, value = "duplicateCase", defaultValue = "false") Boolean duplicateCase,
// @RequestBody(required = false) Map<String, Object> importParameters,
// @RequestHeader(HEADER_USER_ID) String userId

import { UUID } from 'crypto';
import { PREFIX_STUDY_QUERIES } from '.';
import { backendFetch } from 'utils/rest-api';

interface BasicStudyInfos {
    uniqueId: string;
    id: UUID;
    userId: string;
}

export const importStudy = (
    caseUuid: UUID,
    studyUuid: UUID,
    importParameters: Record<string, any>
): Promise<BasicStudyInfos> => {
    const importStudyUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/cases/' +
        encodeURIComponent(caseUuid);

    console.debug(importStudyUrl);

    return backendFetch(importStudyUrl, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
    });
};
