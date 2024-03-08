import { UUID } from 'crypto';
import { backendFetchJson } from './utils';

const PREFIX_CASE_QUERIES = import.meta.env.VITE_API_GATEWAY + '/case';

export function createCase(selectedFile: File): Promise<UUID> {
    const createCaseUrl = PREFIX_CASE_QUERIES + '/v1/cases';
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('withExpiration', encodeURIComponent(true));
    console.debug(createCaseUrl);

    return backendFetchJson(createCaseUrl, {
        method: 'post',
        body: formData,
    });
}
