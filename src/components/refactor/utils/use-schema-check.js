import { useState } from 'react';
import yup from '../utils/yup-config';

export const useSchemaCheck = (yupSchema) => {
    const [schema] = useState(yupSchema);

    const isFieldRequired = (fieldName) => {
        return yup.reach(schema, fieldName)?.exclusiveTests?.required === true;
    };

    return [isFieldRequired];
};
