// Imports
import { useState, useEffect } from 'react';

// Shape of one <option> in the dropdown: display label + machine name value.
export type ContentType = { label: string; value: string };

// Fetches every content type from Drupal and shapes it into label/value pairs.
async function getAllContentTypes(): Promise<ContentType[]> {
    const response: Response = await fetch('http://dtest.ddev.site/jsonapi/node_type/node_type');
    if (!response.ok) {
        throw new Error(`JSON:API request failed: ${response.status}`);
    }
    const json = await response.json();
    if (json.data.length === 0) {
        throw new Error('No Drupal content types found');
    }
    return json.data.map((item: any) => ({
        label: item.attributes.name,
        value: item.attributes.drupal_internal__type,
    }));
}

// This component doesn't fetch anything about the *selection* itself —
// it just reports the chosen machine name up to whoever renders it.
type ContentTypeProps = {
    onSelect: (contentType: string) => void;
};

/**
 *  ContentType
 *
 * @constructor
 */
export function ContentType ({ onSelect }: ContentTypeProps) {
    // Holds the fetched content types; starts empty until the effect below resolves.
    const [types, setTypes] = useState<ContentType[]>([]);

    // Runs once on mount ([] dependency array) to load the dropdown options.
    useEffect(() => {
        getAllContentTypes().then(setTypes);
    }, []);

    return (
        // Report the picked value up via the onSelect prop — no local fetching here.
        <select onChange={(e) => onSelect(e.target.value)}>
            <option selected value=''>
                --- Choose Content Type
            </option>
            {types.map((item) => (
                <option key={item.value} value={item.value}>
                    {item.label}
                </option>
            ))}
        </select>
    );
}
