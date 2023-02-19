import FormControl from '@mui/material/FormControl';
import { FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useController } from 'react-hook-form';
import {FieldLabel} from "../../dialogs/inputs/hooks-helpers";

const RadioInput = ({ name, label, id, options }) => {
    const {
        field: { onChange, value },
    } = useController({ name });

    return (
        <FormControl>
            {label && (
                <FormLabel id={id ? id : label}>
                    <FormattedMessage id={label} />
                </FormLabel>
            )}
            <RadioGroup
                row
                aria-labelledby={id ? id : label}
                value={value}
                onChange={onChange}
            >
                {options.map((value) => (
                    <FormControlLabel
                        control={<Radio />}
                        value={value.id}
                        key={value.id}
                        label={<FieldLabel label={value.label}/>}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
};

export default RadioInput;
