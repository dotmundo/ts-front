// Menu.tsx — presentational navigation.
//
// Pure and reusable: it takes a menu tree and renders it. No data fetching,
// no state. Any region that has navigation (header, footer, sidebar) can
// render <Menu links={…} />.

// One menu entry. `children` mirrors Drupal's nested menu structure, so the
// same type describes any depth of sub-menu.
export type MenuLink = {
    title: string;
    url: string;
    children: MenuLink[];
};

type MenuProps = {
    links: MenuLink[];
    ariaLabel?: string;
};

export function Menu({ links, ariaLabel = 'Main navigation' }: MenuProps) {
    if (links.length === 0) {
        return null;
    }
    return (
        <nav className="menu" aria-label={ariaLabel}>
            <MenuBranch links={links} />
        </nav>
    );
}

// Recursive <ul>: renders one level and calls itself for each child level.
function MenuBranch({ links }: { links: MenuLink[] }) {
    return (
        <ul className="menu__list">
            {links.map((link) => (
                <li className="menu__item" key={`${link.url}:${link.title}`}>
                    <a className="menu__link" href={link.url}>
                        {link.title}
                    </a>
                    {link.children.length > 0 && <MenuBranch links={link.children} />}
                </li>
            ))}
        </ul>
    );
}
