import { useEffect, useState } from 'react';
import { fetchMapBoxToken } from 'services/utils';

const FALLBACK_MAPBOX_TOKEN =
    'pk.eyJ1IjoiZ2VvZmphbWciLCJhIjoiY2pwbnRwcm8wMDYzMDQ4b2pieXd0bDMxNSJ9.Q4aL20nBo5CzGkrWtxroug';

export const useMapBoxToken = () => {
    const [mapBoxToken, setMapBoxToken] = useState<string>();

    useEffect(() => {
        fetchMapBoxToken().then((token) =>
            setMapBoxToken(token || FALLBACK_MAPBOX_TOKEN),
        );
    }, []);

    return mapBoxToken;
};
