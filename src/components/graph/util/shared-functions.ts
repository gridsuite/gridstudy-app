import { NetworkModificationNodeData, NodeType, RootNodeData } from '../tree-node.type';
import { UUID } from 'crypto';
import { CurrentTreeNode, ReactFlowModificationNodeData, ReactFlowRootNodeData } from '../../../redux/reducer';

// type guard to check if the node is a modification node
export function isModificationNode(
    node: NetworkModificationNodeData | RootNodeData
): node is NetworkModificationNodeData {
    return node.type === NodeType.NETWORK_MODIFICATION;
}

// Return the first node of type nodeType and specific buildStatus
export function isRootNode(node: NetworkModificationNodeData | RootNodeData): node is NetworkModificationNodeData {
    return node.type === NodeType.ROOT;
}

export function getModificationNodeDataOrUndefined(node: NetworkModificationNodeData | RootNodeData) {
    if (isModificationNode(node)) {
        return node;
    }
    return undefined;
}

function convertRootNodeToReactFlowModelNode(node: NetworkModificationNodeData | RootNodeData): ReactFlowRootNodeData {
    return {
        label: node.name,
        description: node.description ?? undefined,
    };
}

function convertModificationNodeToReactFlowModelNode(node: NetworkModificationNodeData): ReactFlowModificationNodeData {
    const networkModificationNodeData = getModificationNodeDataOrUndefined(node);
    const globalBuildStatus = networkModificationNodeData?.nodeBuildStatus?.globalBuildStatus;
    const localBuildStatus = networkModificationNodeData?.nodeBuildStatus?.localBuildStatus;
    return {
        label: node.name,
        description: node.description ?? undefined,
        globalBuildStatus: globalBuildStatus,
        localBuildStatus: localBuildStatus,
    };
}

export function convertNodetoReactFlowModelNode(
    node: NetworkModificationNodeData | RootNodeData,
    parentId?: UUID
): CurrentTreeNode {
    return {
        id: node.id,
        type: node.type,
        position: { x: 0, y: 0 },
        parentId: parentId,
        data: isRootNode(node)
            ? convertRootNodeToReactFlowModelNode(node)
            : convertModificationNodeToReactFlowModelNode(node),
        draggable: isModificationNode(node),
    };
}
