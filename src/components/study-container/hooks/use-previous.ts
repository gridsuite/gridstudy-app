import { useEffect, useRef } from 'react';

const usePrevious = <TValue>(
    value: TValue,
    initialValue?: TValue
): TValue | undefined => {
    const ref = useRef(initialValue);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

export default usePrevious;
