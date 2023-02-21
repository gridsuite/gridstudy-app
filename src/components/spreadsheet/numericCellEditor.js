import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const KEY_BACKSPACE = 'Backspace';
const KEY_DELETE = 'Delete';
const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';

export default forwardRef((props, ref) => {
    const createInitialState = () => {
        return {
            value: props.value,
        };
    };

    const initialState = createInitialState();
    const [value, setValue] = useState(initialState.value);
    const refInput = useRef(null);

    useEffect(() => {
        window.setTimeout(() => {
            const eInput = refInput.current;
            eInput.focus();
        });
    }, []);

    const isLeftOrRight = (event) => {
        return ['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1;
    };

    const isCharNumeric = (charStr) => {
        return !!/\d/.test(charStr);
    };

    const isKeyPressedNumeric = (event) => {
        const charStr = event.key;
        return isCharNumeric(charStr);
    };

    const deleteOrBackspace = (event) => {
        return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.key) > -1;
    };

    const finishedEditingPressed = (event) => {
        const key = event.key;
        return key === KEY_ENTER || key === KEY_TAB;
    };

    const onKeyDown = (event) => {
        if (isLeftOrRight(event) || deleteOrBackspace(event)) {
            event.stopPropagation();
            return;
        }

        if (!finishedEditingPressed(event) && !isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    };

    useImperativeHandle(ref, () => {
        return {
            getValue() {
                return value;
            },
        };
    });

    return (
        <input
            ref={refInput}
            type={'number'}
            className={'simple-input-editor'}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => onKeyDown(event)}
        />
    );
});
