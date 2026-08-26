// Imports
import { Content } from './ContentBrowser';

// Dumb/presentational: only knows how to render items and report a click —
// it doesn't fetch anything or know where `items` came from.
type ContentListProps = {
    items: Content[];
    onSelect: (nid: number) => void;
};

export function ContentList({ items, onSelect }: ContentListProps) {
    return (
        <ul>
            {items.map((item) => (
                // Clicking an item just reports its nid up via onSelect.
                <li key={item.id} onClick={() => onSelect(item.nid)}>
                    {item.summary || `Node ${item.nid}`}
                </li>
            ))}
        </ul>
    );
}
