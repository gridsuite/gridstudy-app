import React from 'react';

interface TitleProps {
    title: string;
}

const Title = ({ title }: TitleProps) => {
    return (
        <>
            <h2>test title</h2>
            <h1>{title}</h1>
        </>
    );
};

export default Title;
