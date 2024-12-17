import { useIntl } from 'react-intl';
import { ElementType, DirectoryItemSelector, TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

interface ImportCaseDialogProps {
    open: boolean;
    onClose: () => void;
    onSelectCase: (selectedElement: TreeViewFinderNodeProps) => void;
}

const ImportCaseDialog: FunctionComponent<ImportCaseDialogProps> = ({ open, onClose, onSelectCase }) => {
    const intl = useIntl();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const rootNetworkUuid = useSelector((state: AppState) => state.rootNetworkUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const processSelectedElements = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements && selectedElements.length > 0) {
            const selectedCase = selectedElements[0]; // Assuming single selection
            onSelectCase(selectedCase); 
        }
        onClose();
    };

    return (
        <DirectoryItemSelector
            open={open}
            onClose={processSelectedElements}
            types={[ElementType.CASE]}
            title={intl.formatMessage({
                id: 'ChooseSituation',
            })}
            multiSelect={false}
        />
    );
};

export default ImportCaseDialog;
