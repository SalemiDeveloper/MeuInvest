import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img
            src="/meuinvest-logo.png"
            alt="MeuInvest"
            {...props}
        />
    );
}