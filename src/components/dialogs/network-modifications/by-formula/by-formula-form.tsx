import { FunctionComponent } from 'react';
import { SelectInput } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EQUIPMENT_TYPE_FIELD, FORMULAS } from '../../../utils/field-constants';
import ExpandableInput from '../../../utils/rhf-inputs/expandable-input';
import FormulaForm from './formula/formula-form';
import Grid from '@mui/material/Grid';
import { gridItem } from '../../dialogUtils';

interface ByFormulaFormProps {}

const EQUIPMENT_TYPE_OPTIONS = [
    {id: EQUIPMENT_TYPES.GENERATOR, label: EQUIPMENT_TYPES.GENERATOR},
    {id: EQUIPMENT_TYPES.BATTERY, label: EQUIPMENT_TYPES.BATTERY},
];

const ByFormulaForm: FunctionComponent<ByFormulaFormProps> = ({}) => {
    const equipmentTypeField = (
        <SelectInput
            name={EQUIPMENT_TYPE_FIELD}
            label={'EquipmentType'}
            options={EQUIPMENT_TYPE_OPTIONS}
            size={'small'}
        />
    );

    const formulasField = (
        <ExpandableInput name={FORMULAS} Field={FormulaForm} />
    );

    return (
        <>
            <Grid container>{gridItem(equipmentTypeField, 2.15)}</Grid>
            <Grid container>{gridItem(formulasField, 12)}</Grid>
        </>
    );
};

export default ByFormulaForm;