export const isStringOrNonEmptyArray = (value: unknown): value is string | unknown[] => {
    if (typeof value === 'string' && value.length > 0) {
        return true;
    }
    return Array.isArray(value) && value.length > 0;
};
