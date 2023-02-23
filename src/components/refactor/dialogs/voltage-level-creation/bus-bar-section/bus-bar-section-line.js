import { gridItem } from 'components/dialogs/dialogUtils';
import IntegerInput from 'components/refactor/rhf-inputs/integer-input';
import TextInput from 'components/refactor/rhf-inputs/text-input';
import {
    HORIZONTAL_POSITION,
    ID,
    NAME,
    VERTICAL_POSITION,
} from 'components/refactor/utils/field-constants';

export const numericalWithButton = {
    type: 'number',
    inputProps: { min: 0, style: { textAlign: 'right' } },
};

export const BusBarSectionLine = ({ id, index }) => {
    const equipmentIdField = (
        <TextInput name={`${id}.${index}.${ID}`} label={'BusBarSectionID'} />
    );
    const equipmentNameField = (
        <TextInput
            name={`${id}.${index}.${NAME}`}
            label={'Name'}
            withButton={true}
        />
    );

    const horizontalPositionField = (
        <IntegerInput
            name={`${id}.${index}.${HORIZONTAL_POSITION}`}
            label="BusBarHorizPos"
            formProps={{
                ...numericalWithButton,
            }}
        />
    );

    const verticalPositionField = (
        <IntegerInput
            name={`${id}.${index}.${VERTICAL_POSITION}`}
            label="BusBarVertPos"
            formProps={{
                ...numericalWithButton,
            }}
        />
    );

    return (
        <>
            {gridItem(equipmentIdField, 2.5)}
            {gridItem(equipmentNameField, 2.5)}
            {gridItem(horizontalPositionField, 2.5)}
            {gridItem(verticalPositionField, 2.5)}
        </>
    );
};
