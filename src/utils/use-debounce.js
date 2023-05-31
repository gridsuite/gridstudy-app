import { useMemo } from 'react';
import { debounce } from '@mui/material/utils';

const useDebounce = (updateParameter, delay) => {
    return useMemo(
        () => debounce(updateParameter, delay),
        [updateParameter, delay]
    );
};

export default useDebounce;
