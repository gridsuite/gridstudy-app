import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import {
    ElementSearchDialog,
    EquipmentInfos,
    EquipmentItem,
    equipmentStyles,
} from '@gridsuite/commons-ui';
import { FunctionComponent, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { CustomSuffixRenderer } from './custom-suffix-renderer';
import { Equipment } from '@gridsuite/commons-ui/dist/utils/types';
import { useDisabledSearchReason } from './use-disabled-search-reason';
import { useSearchEvent } from './use-search-event';
import { useTopBarSearchMatchingEquipment } from './use-top-bar-search-matching-equipments';

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
    const intl = useIntl();

    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const { searchTerm, updateSearchTerm, equipmentsToReturn, isLoading } =
        useTopBarSearchMatchingEquipment({
            studyUuid: studyUuid,
            nodeUuid: currentNode?.id,
        });
    const disabledSearchReason = useDisabledSearchReason();

    const enableSearchDialog = useCallback(() => {
        setIsDialogSearchOpen(true);
    }, [setIsDialogSearchOpen]);

    const onSelectionChange = useCallback(
        (element: EquipmentInfos) => {
            setIsDialogSearchOpen(false);
            showVoltageLevelDiagram(element);
        },
        [setIsDialogSearchOpen, showVoltageLevelDiagram]
    );

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
            onSelectionChange={onSelectionChange}
            elementsFound={equipmentsToReturn}
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
