import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import {
    ElementSearchDialog,
    EquipmentItem,
    equipmentStyles,
} from '@gridsuite/commons-ui';
import { FunctionComponent, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSearchMatchingEquipments } from './use-search-matching-equipments';
import { CustomSuffixRenderer } from './custom-suffix-renderer';
import { Equipment } from '@gridsuite/commons-ui/dist/utils/types';
import { useDisabledSearchReason } from './use-disabled-search-reason';
import { useSearchEvent } from './use-search-event';

interface TopBarEquipmentSearchDialogProps {
    showVoltageLevelDiagram: (element: Equipment) => void;
    isDialogSearchOpen: boolean;
    setIsDialogSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TopBarEquipmentSearchDialog: FunctionComponent<
    TopBarEquipmentSearchDialogProps
> = (props) => {
    const {
        isDialogSearchOpen,
        setIsDialogSearchOpen,
        showVoltageLevelDiagram,
    } = props;
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    console.log('CURRENT NODE', currentNode);
    const intl = useIntl();

    const { searchTerm, updateSearchTerm, equipmentsFound, isLoading } =
        useSearchMatchingEquipments({
            studyUuid: studyUuid,
            nodeUuid: currentNode?.id,
        });
    const disabledSearchReason = useDisabledSearchReason();

    const enableSearchDialog = useCallback(() => {
        setIsDialogSearchOpen(true);
    }, [setIsDialogSearchOpen]);

    useSearchEvent(enableSearchDialog);

    return (
        <ElementSearchDialog
            open={isDialogSearchOpen}
            onClose={() => setIsDialogSearchOpen(false)}
            searchingLabel={intl.formatMessage({
                id: 'equipment_search/label',
            })}
            searchTerm={searchTerm}
            onSearchTermChange={updateSearchTerm}
            onSelectionChange={(element) => {
                setIsDialogSearchOpen(false);
                showVoltageLevelDiagram(element);
            }}
            elementsFound={equipmentsFound}
            renderElement={(props) => (
                <EquipmentItem
                    styles={equipmentStyles}
                    {...props}
                    key={'ei-' + props.element.key}
                    suffixRenderer={CustomSuffixRenderer}
                />
            )}
            searchTermDisabled={disabledSearchReason !== ''}
            searchTermDisableReason={disabledSearchReason}
            isLoading={isLoading}
        />
    );
};
