import { FieldConstants, Parameter } from '@gridsuite/commons-ui';
import { CASE_ID, CASE_NAME, DESCRIPTION, NAME, TAG } from 'components/utils/field-constants';

export interface RootNetworkCreationFormData {
    [NAME]: string;
    [TAG]: string;
    [CASE_NAME]: string;
    [CASE_ID]: string;
    [DESCRIPTION]?: string;
}

export interface RootNetworkModificationFormData {
    [NAME]: string;
    [TAG]: string;
    [CASE_NAME]: string;
    [CASE_ID]: string;
    [DESCRIPTION]?: string;
    [FieldConstants.FORMATTED_CASE_PARAMETERS]: Parameter[];
    [FieldConstants.CURRENT_PARAMETERS]: Record<string, string>;
    [FieldConstants.CASE_FORMAT]?: string;
}

export type RootNetworkFormData = RootNetworkCreationFormData | RootNetworkModificationFormData;
