import { MODIFICATION_TYPES } from 'components/utils/modification-type';

export interface TabularModificationFields {
    [key: string]: string[];
}

export const TABULAR_MODIFICATION_FIELDS: TabularModificationFields = {
    GENERATOR: ['equipmentId', 'maxActivePower'],
    LOAD: ['equipmentId', 'activePower'],
};

export const TABULAR_MODIFICATION_TYPES = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
};

export interface Modification {
    [key: string]: string;
}
