import { useEffect, useState } from 'react';

export const useLoadflowModifications = () => {
    const [data, setData] = useState<{
        twt: { twoWindingsTransformerId: string; tapPositionIn: number; tapPositionOut: number; type: string }[];
        sc: { shuntCompensatorId: string; sectionCountIn: number; sectionCountOut: number }[];
    }>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setData({
                twt: [
                    {
                        twoWindingsTransformerId: 'ID1',
                        tapPositionIn: 0,
                        tapPositionOut: 4,
                        type: 'testType',
                    },
                ],
                sc: [
                    {
                        shuntCompensatorId: 'ID2',
                        sectionCountIn: 1,
                        sectionCountOut: 9,
                    },
                ],
            });
            setIsLoading(false);
        }, 2000);
    }, []);

    return [data, isLoading] as const;
};
