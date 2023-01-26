import { getIn } from 'yup/lib/util/reach';

export const isFieldRequired = (fieldName, schema, values) => {
    const { schema: fieldSchema, parent: parentValues } =
        getIn(schema, fieldName, values) || {};

    return (
        fieldSchema.resolve({ parent: parentValues })?.exclusiveTests
            ?.required === true
    );

    //static way, not working when using "when" in schema, but does not need form values
    //return yup.reach(schema, fieldName)?.exclusiveTests?.required === true;
};

export const areArrayElementsUnique = (array) => {
    let uniqueAlphaValues = [...new Set(array)];
    return uniqueAlphaValues.length === array.length;
};

export const areArrayElementsOrdered = (array) => {
    if (array.length <= 1) return true;
    if (array[0] === array[1]) {
        return false;
    } else if (array[0] < array[1]) {
        for (let index = 0; index < array.length - 1; index++) {
            if (array[index] >= array[index + 1]) {
                return false;
            }
        }
    } else if (array[0] > array[1]) {
        for (let index = 0; index < array.length - 1; index++) {
            if (array[index] <= array[index + 1]) {
                return false;
            }
        }
    }

    return true;
};
