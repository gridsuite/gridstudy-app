import { useIntlRef } from '@gridsuite/commons-ui';
import { UUID, randomUUID } from 'crypto';
import { useEffect, useState } from 'react';
import { fetchStudyExists } from 'services/study';
import { HttpStatusCode } from 'utils/http-status-code';

const useStudy = (
    studyUuidRequest: UUID
): [id: UUID, pending: boolean, message: string | undefined] => {
    const intlRef = useIntlRef();
    const [studyUuid, setStudyUuid] = useState<UUID>(randomUUID());
    const [pending, setPending] = useState(true);
    const [errMessage, setErrMessage] = useState<string>();

    useEffect(() => {
        fetchStudyExists(studyUuidRequest)
            .then(() => {
                setStudyUuid(studyUuidRequest);
            })
            .catch((error) => {
                if (error.status !== HttpStatusCode.NOT_FOUND) {
                    setErrMessage(error.message);
                } else {
                    setErrMessage(
                        intlRef.current.formatMessage(
                            { id: 'studyNotFound' },
                            { studyUuid: studyUuidRequest }
                        )
                    );
                }
            })
            .finally(() => setPending(false));
    }, [studyUuidRequest, intlRef]);

    return [studyUuid, pending, errMessage];
};

export default useStudy;
