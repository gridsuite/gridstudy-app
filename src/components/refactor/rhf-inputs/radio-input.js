import FormControl from '@mui/material/FormControl';
import { FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useController } from 'react-hook-form';

const RadioInput = ({ name, label, id, defaultValue, possibleValues }) => {
    const {
        field: { onChange, value },
    } = useController({ name });

    const intl = useIntl();

    return (
        <FormControl
            style={{
                marginTop: '-12px',
            }}
        >
            {label && (
                <FormLabel id={id ? id : label}>
                    <FormattedMessage id={label} />
                </FormLabel>
            )}
            <RadioGroup
                row
                aria-labelledby={id ? id : label}
                value={value ?? defaultValue}
                onChange={onChange}
            >
                {possibleValues.map((value) => (
                    <FormControlLabel
                        control={<Radio />}
                        value={value.id}
                        key={value.id}
                        label={intl.formatMessage({ id: value.label })}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
};

export default RadioInput;
