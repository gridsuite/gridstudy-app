import { getIn } from 'yup/lib/util/reach';

export const isFieldRequired = (fieldName, schema, values) => {
    const { schema: fieldSchema, parent: parentValues } =
        getIn(schema, fieldName, values) || {};

    return (
        fieldSchema.resolve({ parent: parentValues })?.exclusiveTests
            ?.required === true
    );

    //static way, not working when using when in schema
    //return yup.reach(schema, fieldName)?.exclusiveTests?.required === true;
};
