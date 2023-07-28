import { UUID } from 'crypto';
import { backendFetchJson } from 'utils/rest-api';

const PREFIX_NETWORK_CONVERSION_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/network-conversion`;

export interface CaseImportParameters {
    name: string;
    description: string;
    type: string;
    defaultValue: any;
    possibleValues?: string[] | null;
}

export interface GetCaseImportParametersReturn {
    formatName: string;
    parameters: CaseImportParameters[];
}

export function getCaseImportParameters(
    caseUuid: UUID
): Promise<GetCaseImportParametersReturn> {
    console.info(`get import parameters for case '${caseUuid}' ...`);
    const getExportFormatsUrl =
        PREFIX_NETWORK_CONVERSION_SERVER_QUERIES +
        '/v1/cases/' +
        caseUuid +
        '/import-parameters';
    console.debug(getExportFormatsUrl);
    return backendFetchJson(getExportFormatsUrl);
}
