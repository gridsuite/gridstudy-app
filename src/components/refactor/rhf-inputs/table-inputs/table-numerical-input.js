import { TextField, Tooltip } from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';

export const TableNumericalInput = ({
    name,
    min,
    max,
    style,
    inputProps,
    ...props
}) => {
    const { trigger } = useFormContext();
    const {
        field: { onChange, value },
        fieldState: { error },
    } = useController({ name });

    const intl = useIntl();

    const handleInputChange = (e) => {
        console.log('CHANGING', name);
        onChange(e.target.value);
        trigger(name);
    };

    const renderNumericText = (
        <TextField
            value={value}
            onChange={handleInputChange}
            {...props}
            error={error?.message}
            type="Number"
            size={'small'}
            margin={'none'}
            style={{ ...style, padding: 0 }}
            inputProps={{
                style: {
                    textAlign: 'center',
                    fontSize: 'small',
                },
                min: { min },
                max: { max },
                step: 'any',
                lang: 'en-US', // to have . as decimal separator
                ...inputProps,
            }}
        />
    );

    const renderNumericTextWithTooltip = () => {
        let tooltip = '';
        if (min !== undefined && max !== undefined) {
            tooltip = intl.formatMessage({ id: 'MinMax' }, { min, max });
        } else if (min !== undefined) {
            tooltip = intl.formatMessage({ id: 'OnlyMin' }, { min });
        } else if (max !== undefined) {
            tooltip = intl.formatMessage({ id: 'OnlyMax' }, { max });
        }
        if (tooltip !== '') {
            return <Tooltip title={tooltip}>{renderNumericText()}</Tooltip>;
        }
        return renderNumericText;
    };

    return <div>{renderNumericTextWithTooltip()}</div>;
};
