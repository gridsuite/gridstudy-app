import { useSelector } from 'react-redux';
import {
    ReduxState,
    StudyDisplayMode,
    StudyIndexationStatus,
} from 'redux/reducer.type';
import {
    ElementSearchDialog,
    EquipmentItem,
    equipmentStyles,
} from '@gridsuite/commons-ui';
import { FunctionComponent, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useSearchMatchingEquipments } from './search-matching-equipments';
import { CustomSuffixRenderer } from './custom-suffix-renderer';
import { Equipment } from '@gridsuite/commons-ui/dist/utils/types';
import { isNodeBuilt } from 'components/graph/util/model-functions';

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
    const studyDisplayMode = useSelector(
        (state: ReduxState) => state.studyDisplayMode
    );
    const studyIndexationStatus = useSelector(
        (state: ReduxState) => state.studyIndexationStatus
    );
    const intl = useIntl();
    const user = useSelector((state: ReduxState) => state.user);
    const {
        debouncedSearchMatchingEquipments: searchMatchingEquipments,
        equipmentsFound,
    } = useSearchMatchingEquipments({
        studyUuid: studyUuid,
        nodeUuid: currentNode?.id,
    });

    useEffect(() => {
        if (user) {
            const openSearch = (e: KeyboardEvent) => {
                if (
                    e.ctrlKey &&
                    e.shiftKey &&
                    (e.key === 'F' || e.key === 'f')
                ) {
                    e.preventDefault();
                    setIsDialogSearchOpen(true);
                }
            };
            document.addEventListener('keydown', openSearch);
            return () => document.removeEventListener('keydown', openSearch);
        }
    }, [user, setIsDialogSearchOpen]);

    function getDisableReason() {
        if (studyDisplayMode === StudyDisplayMode.TREE) {
            return intl.formatMessage({
                id: 'UnsupportedView',
            });
        } else if (!isNodeBuilt(currentNode)) {
            return intl.formatMessage({
                id: 'InvalidNode',
            });
        } else if (studyIndexationStatus !== StudyIndexationStatus.INDEXED) {
            return intl.formatMessage({
                id: 'waitingStudyIndexation',
            });
        } else {
            return '';
        }
    }

    return (
        <ElementSearchDialog
            open={isDialogSearchOpen}
            onClose={() => setIsDialogSearchOpen(false)}
            searchingLabel={intl.formatMessage({
                id: 'equipment_search/label',
            })}
            onSearchTermChange={searchMatchingEquipments}
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
            searchTermDisabled={getDisableReason() !== ''}
            searchTermDisableReason={getDisableReason()}
        />
    );
};
