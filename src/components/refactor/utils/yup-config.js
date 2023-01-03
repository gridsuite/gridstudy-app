import * as yup from 'yup';

yup.setLocale({
    mixed: {
        required: 'YupRequired',
        notType: ({ type }) => {
            if (type === 'number') {
                return 'YupNotTypeNumber';
            } else {
                return 'YupNotTypeDefault';
            }
        },
    },
});

export default yup;
