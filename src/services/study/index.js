export const PREFIX_STUDY_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/study';

export const getStudyUrl = (studyUuid) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}`;

export const getStudyUrlWithNodeUuid = (studyUuid, nodeUuid) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(
        studyUuid
    )}/nodes/${encodeURIComponent(nodeUuid)}`;
