import { UUID } from 'crypto';
import { useEffect, useState } from 'react';
import { fetchVoltageLevelsListInfos } from '../services/study/network';

export default function useVoltageLevelsListInfos(
    studyUuid: UUID,
    nodeUuid: UUID
) {
    const [voltageLevelsListInfos, setVoltageLevelsListInfos] = useState([]);
    useEffect(() => {
        if (studyUuid && nodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, nodeUuid).then((values) => {
                setVoltageLevelsListInfos(
                    values.sort((a: { id: string }, b: { id: string }) =>
                        a.id.localeCompare(b.id)
                    )
                );
            });
        }
    }, [studyUuid, nodeUuid]);
    return voltageLevelsListInfos;
}
