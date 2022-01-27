import * as React from 'react';
import { useTranslate } from 'react-admin';

const Logo = (props: any) => {
    const translate = useTranslate();
    return (
        <img src="/logo.png" height="36px" />
    );
};

export default Logo;
