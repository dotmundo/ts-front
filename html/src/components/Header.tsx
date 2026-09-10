// Header.tsx — the "site header" region.
//
// This is the template for every other region component:
//   - it owns a small loading / error / ready state machine
//   - it fetches its own data from Drupal in an effect
//   - it hands the data to presentational children (here, <Menu>)
//
// Backend: the Drupal side exposes GET /ts-demo/header returning
//   { siteName, slogan, logoUrl, menu }
// (see the README for the controller).
import { useEffect, useState } from 'react';
import { getJson } from '../api';
import { Menu, type MenuLink } from './Menu';

// The JSON contract this component depends on.
export type HeaderData = {
    siteName: string;
    slogan: string;
    logoUrl: string;
    menu: MenuLink[];
};

// One of three states — nothing is ever rendered "half loaded".
type HeaderState =
    | { phase: 'loading' }
    | { phase: 'error'; message: string }
    | { phase: 'ready'; data: HeaderData };

export function Header() {
    const [state, setState] = useState<HeaderState>({ phase: 'loading' });

    useEffect(() => {
        // `cancelled` stops a slow response from setting state after the
        // component unmounts (and quiets React StrictMode's double-run).
        let cancelled = false;

        getJson<HeaderData>('/ts-demo/header')
            .then((data) => {
                if (!cancelled) {
                    setState({ phase: 'ready', data });
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    const message = error instanceof Error ? error.message : String(error);
                    setState({ phase: 'error', message });
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (state.phase === 'loading') {
        return <header className="site-header site-header--status">Loading header…</header>;
    }

    if (state.phase === 'error') {
        return (
            <header className="site-header site-header--status site-header--error" role="alert">
                Couldn’t load the header: {state.message}
            </header>
        );
    }

    const { siteName, slogan, logoUrl, menu } = state.data;
    return (
        <header className="site-header">
            <a className="site-header__brand" href="/">
                {logoUrl && <img className="site-header__logo" src={logoUrl} alt={`${siteName} logo`} />}
                <span className="site-header__name">{siteName}</span>
            </a>

            {slogan && <p className="site-header__slogan">{slogan}</p>}

            <Menu links={menu} />
        </header>
    );
}
