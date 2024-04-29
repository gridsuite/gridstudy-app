import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';

export const useSearchEvent = (enableSearchCallback: () => void) => {
    const user = useSelector((state: ReduxState) => state.user);

    useEffect(() => {
        if (user) {
            const openSearch = (e: KeyboardEvent) => {
                if (
                    e.ctrlKey &&
                    e.shiftKey &&
                    (e.key === 'F' || e.key === 'f')
                ) {
                    e.preventDefault();
                    enableSearchCallback();
                }
            };
            document.addEventListener('keydown', openSearch);
            return () => document.removeEventListener('keydown', openSearch);
        }
    }, [user, enableSearchCallback]);
};
