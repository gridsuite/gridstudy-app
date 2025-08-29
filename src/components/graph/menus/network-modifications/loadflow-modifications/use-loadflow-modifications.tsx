import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { fetchLoadFlowModifications } from 'services/study/loadflow';

export const useLoadflowModifications = () => {
    const studyUuid = useSelector((appState: AppState) => appState.studyUuid);
    const currentNode = useSelector((appState: AppState) => appState.currentTreeNode);
    const currentRootNetworkUuid = useSelector((appState: AppState) => appState.currentRootNetworkUuid);
    const [data, setData] = useState<{
        twoWindingsTransformerModifications: {
            twoWindingsTransformerId: string;
            tapPositionIn: number;
            tapPositionOut: number;
            type: string;
        }[];
        shuntCompensatorModifications: {
            shuntCompensatorId: string;
            sectionCountIn: number;
            sectionCountOut: number;
        }[];
    }>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!studyUuid || !currentNode || !currentRootNetworkUuid) {
            return;
        }
        setIsLoading(true);
        fetchLoadFlowModifications(studyUuid, currentNode.id, currentRootNetworkUuid)
            .then((modifications) => {
                setData(modifications);
            })
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
    }, [studyUuid, currentNode, currentRootNetworkUuid]);

    return [data, isLoading] as const;
};
