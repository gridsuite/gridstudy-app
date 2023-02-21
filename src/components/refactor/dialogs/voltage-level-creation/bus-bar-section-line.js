import { Grid, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    filledTextField,
    gridItem,
    useStyles,
} from 'components/dialogs/dialogUtils';
import IntegerInput from 'components/refactor/rhf-inputs/integer-input';
import TextInput from 'components/refactor/rhf-inputs/text-input';
import {
    BUS_BAR_SECTIONS,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HORIZONTAL_POSITION,
    ID,
    NAME,
    VERTICAL_POSITION,
} from 'components/refactor/utils/field-constants';

export const BusBarSectionLine = ({ id, index }) => {
    const equipmentIdField = (
        <TextInput
            name={`${id}.${index}.${ID}`}
            label={'Name'}
            formProps={filledTextField}
            // inputTransform={(e) => handleChange(e, EQUIPMENT_NAME)}
        />
    );
    const equipmentNameField = (
        <TextInput
            name={`${id}.${index}.${NAME}`}
            label={'Name'}
            formProps={filledTextField}
            // inputTransform={(e) => handleChange(e, EQUIPMENT_NAME)}
        />
    );

    const horizontalPositionField = (
        <IntegerInput
            name={`${id}.${index}.${HORIZONTAL_POSITION}`}
            label="BusBarHorizPos"
            formProps={
                {
                    // disabled: disabled,
                }
            }
            //inputTransform={(e) => handleChange(e, HORIZONTAL_POSITION)}
        />
    );

    const verticalPositionField = (
        <IntegerInput
            name={`${id}.${index}.${VERTICAL_POSITION}`}
            label="BusBarVertPos"
            formProps={
                {
                    // disabled: disabled,
                }
            }
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
