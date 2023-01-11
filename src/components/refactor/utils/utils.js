import yup from './yup-config';

export const isFieldRequired = (fieldName, schema) => {
    return yup.reach(schema, fieldName)?.exclusiveTests?.required === true;
};
