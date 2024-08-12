import { FunctionComponent, useMemo } from 'react';
import { Grid, Select } from '@mui/material';
import { useSelector } from 'react-redux';
import { BUILD_STATUS } from '../network/constants';
import MenuItem from '@mui/material/MenuItem';

interface NodePickerInterface {
    value: string;
    handleSelectedNode: (event: any) => void;
}

const NodePicker: FunctionComponent<NodePickerInterface> = ({
    value,
    handleSelectedNode,
}) => {
    const treeModel = useSelector(
        (state: any) => state.networkModificationTreeModel
    );
    const currentNode = useSelector((state: any) => state.currentTreeNode);

    const builtNodes = useMemo(() => {
        return treeModel.treeNodes
            .filter(
                (node: any) =>
                    node.data.localBuildStatus !== BUILD_STATUS.NOT_BUILT &&
                    node.type === 'NETWORK_MODIFICATION' &&
                    node.id !== currentNode?.id
            )
            .map((node: any) => {
                return {
                    id: node.id,
                    label: node.data.label,
                };
            });
    }, [treeModel?.treeNodes]);

    return (
        <>
            <Grid container>
                <span style={{ margin: 'auto 0', paddingRight: '10px' }}>
                    Node to compare current data to :
                </span>
                <Select
                    label={'label'}
                    id={'label'}
                    onChange={handleSelectedNode}
                    value={value ?? ''}
                >
                    {builtNodes.map((node: any) => {
                        return (
                            <MenuItem key={node?.id} value={node?.id}>
                                {node?.label}
                            </MenuItem>
                        );
                    })}
                </Select>
            </Grid>
        </>
    );
};

export default NodePicker;
