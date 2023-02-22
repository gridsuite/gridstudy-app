import { filledTextField, gridItem } from 'components/dialogs/dialogUtils';
import IntegerInput, {
    numericalWithButton,
} from 'components/refactor/rhf-inputs/integer-input';
import TextInput from 'components/refactor/rhf-inputs/text-input';
import {
    BUS_BAR_SECTIONS,
    HORIZONTAL_POSITION,
    ID,
    NAME,
    VERTICAL_POSITION,
} from 'components/refactor/utils/field-constants';

export const getBusBarSectionLineFormData = (
    {
        busBarSectionId,
        busBarSectionName,
        horizontalPosition,
        verticalPosition,
    },
    id = BUS_BAR_SECTIONS
) => ({
    [id]: {
        [ID]: busBarSectionId,
        [NAME]: busBarSectionName,
        [HORIZONTAL_POSITION]: horizontalPosition,
        [VERTICAL_POSITION]: verticalPosition,
    },
});

export const BusBarSectionLine = ({ id, index }) => {
    const equipmentIdField = (
        <TextInput
            name={`${id}.${index}.${ID}`}
            label={'BusBarSectionID'}
            //formProps={filledTextField}
            // inputTransform={(e) => handleChange(e, EQUIPMENT_NAME)}
        />
    );
    const equipmentNameField = (
        <TextInput
            name={`${id}.${index}.${NAME}`}
            label={'Name'}
            withButton={true}
            // formProps={filledTextField}
            // inputTransform={(e) => handleChange(e, EQUIPMENT_NAME)}
        />
    );

    const horizontalPositionField = (
        <IntegerInput
            name={`${id}.${index}.${HORIZONTAL_POSITION}`}
            label="BusBarHorizPos"
            formProps={{
                // disabled: disabled,
                ...numericalWithButton,
            }}
            //inputTransform={(e) => handleChange(e, HORIZONTAL_POSITION)}
        />
    );

    const verticalPositionField = (
        <IntegerInput
            name={`${id}.${index}.${VERTICAL_POSITION}`}
            label="BusBarVertPos"
            formProps={{
                // disabled: disabled,
                ...numericalWithButton,
            }}
            //inputTransform={(e) => handleChange(e, HORIZONTAL_POSITION)}
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
