import { useState, useEffect } from 'react';

export const useOpenOnMount = (editData, infos, delay = 0) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!editData || (editData && infos)) {
            setOpen(true);
        } else if (editData && !infos) {
            const timeout = setTimeout(() => setOpen(true), delay);
            return () => clearTimeout(timeout);
        }
    }, [editData, infos, delay]);

    return open;
};
