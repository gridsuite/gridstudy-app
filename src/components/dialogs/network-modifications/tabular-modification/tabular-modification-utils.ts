import { MODIFICATION_TYPES } from 'components/utils/modification-type';

export interface TabularModificationFields {
    [key: string]: string[];
}

export const TABULAR_MODIFICATION_FIELDS: TabularModificationFields = {
    GENERATOR: [
        'equipmentId',
        'minActivePower',
        'activePowerSetpoint',
        'maxActivePower',
    ],
    LOAD: ['equipmentId', 'activePower'],
};

export const TABULAR_MODIFICATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
};

export interface Modification {
    [key: string]: any;
}

export const formatModification = (modification: Modification) => {
    //exclude type, date and uuid from modification object
    const { type, date, uuid, ...rest } = modification;
    return rest;
};

export const getEquipmentTypeFromModificationType = (type: string) => {
    return Object.keys(TABULAR_MODIFICATION_TYPES).find(
        (key) => TABULAR_MODIFICATION_TYPES[key] === type
    );
};
export const styles = {
    csvButton: { mt: 'auto', mb: 'auto' },
    grid: { height: 500, width: '100%' },
};
