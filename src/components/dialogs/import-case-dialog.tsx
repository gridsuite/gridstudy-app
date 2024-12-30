import { useIntl } from 'react-intl';
import { ElementType, DirectoryItemSelector, TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import { FunctionComponent } from 'react';

interface ImportCaseDialogProps {
    open: boolean;
    onClose: () => void;
    onSelectCase: (selectedElement: TreeViewFinderNodeProps) => void;
}

const ImportCaseDialog: FunctionComponent<ImportCaseDialogProps> = ({ open, onClose, onSelectCase }) => {
    const intl = useIntl();

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
