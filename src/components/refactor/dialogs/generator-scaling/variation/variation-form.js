import ElementsInput from '../../../rhf-inputs/elements-input';
import {
    FILTERS,
    P,
    VARIATION_MODE,
    VARIATION_TYPE,
    VARIATION_VALUE,
} from '../../../utils/field-constants';
import { EQUIPMENT_TYPES } from '../../../../util/equipment-types';
import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import SelectInput from '../../../rhf-inputs/select-input';
import { VARIATION_MODES } from '../../../../network/constants';
import FloatInput from '../../../rhf-inputs/float-input';
import {ActivePowerAdornment, gridItem, gridItemWithErrorMsg} from '../../../../dialogs/dialogUtils';
import {elementType} from '@gridsuite/commons-ui';

const IDENTIFIER_LIST = 'IDENTIFIER_LIST';
const VENTILATION = 'VENTILATION';
const STACKING_UP = 'STACKING_UP';
const PROPORTIONAL_TO_PMAX = 'PROPORTIONAL_TO_PMAX';
const GENERATORS = [EQUIPMENT_TYPES.GENERATOR.type];

const VariationForm = ({ id, index }) => {
    const variationMode = useWatch({
        name: `${id}.${index}.${VARIATION_MODE}`,
    });

    const variationType = useWatch({
        name: VARIATION_TYPE,
    });
    const itemFilter = useCallback(
        (value) => {
            if (value?.type === elementType.FILTER) {
                if (variationMode === STACKING_UP) {
                    return value?.specificMetadata?.type === IDENTIFIER_LIST;
                }

                if (variationMode === VENTILATION) {
                    return (
                        value?.specificMetadata?.type === IDENTIFIER_LIST &&
                        value?.specificMetadata?.filterEquipmentsAttributes?.every(
                            (fil) => !!fil.distributionKey
                        )
                    );
                }
            }

            return true;
        },
        [variationMode]
    );

    const filtersField = (
        <ElementsInput
            name={`${id}.${index}.${FILTERS}`}
            equipmentTypes={GENERATORS}
            types={elementType.FILTER}
            label={'filter'}
            titleId={'FiltersListsSelection'}
            itemFilter={itemFilter}
        />
    );

    const variationModeField = (
        <SelectInput
            name={`${id}.${index}.${VARIATION_MODE}`}
            label={'VariationMode'}
            options={VARIATION_MODES}
        />
    );

    const variationValueField = (
        <FloatInput
            name={`${id}.${index}.${VARIATION_VALUE}`}
            label={variationType === 'DELTA_P' ? 'DeltaP' : 'TargetPText'}
            adornment={ActivePowerAdornment}
        />
    );

    return (
        <>
            {gridItem(filtersField, 4)}
            {gridItem(variationValueField, 2)}
            {gridItem(variationModeField, 4)}
        </>
    );
};

export default VariationForm;