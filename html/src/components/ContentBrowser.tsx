// Imports
import { useState } from 'react';
import { ContentType } from './ContentType';
import { ContentList } from './ContentList';

// This is the parent/orchestrator component: it owns the shared state and
// fetching logic that both child widgets need, so they can stay dumb.

// Structures
// The shape we hand to <ContentList> — one entry per node.
export type Content = {
    id: string,
    nid: number,
    vid: number,
    summary: string
};

// The raw shape a single node looks like coming back from JSON:API,
// before we pick out and rename the fields we actually care about.
type JsonApiNodeResource = {
    id: string;
    attributes: {
        drupal_internal__nid: number;
        drupal_internal__vid: number;
        body: { summary: string } | null;
    };
};

/**
 * getAllNodesByContentType
 * GET http://dtest.ddev.site/jsonapi/node/{content_type}
 * @param ctype
 */
async function getAllNodesByContentType(ctype: string): Promise<Content[]> {
    const response: Response = await fetch(`http://dtest.ddev.site/jsonapi/node/${ctype}`);
    if (!response.ok) {
        throw new Error(`JSON:API request failed: ${response.status}`);
    }
    const json = await response.json();
    if (json.data.length === 0) {
        throw new Error('No Drupal content types found');
    }
    return json.data.map((item: JsonApiNodeResource) => ({
        id: item.id,
        nid: item.attributes.drupal_internal__nid,
        vid: item.attributes.drupal_internal__vid,
        summary: item.attributes.body?.summary ?? '',
    }));
}

export function ContentBrowser() {
    // Single source of truth for "what nodes are currently listed" — changing
    // this is what makes <ContentList> re-render, nothing is built manually.
    const [content, setContent] = useState<Content[]>([]);

    // Fired when ContentType reports a selection; fetches that type's
    // nodes and stores them, which triggers ContentList to re-render.
    const handleTypeSelected = async (contentType: string) => {
        const result = await getAllNodesByContentType(contentType);
        setContent(result);
    };

    // Fired when ContentList reports a selection.
    const handleNodeSelected = (nid: number) => {
        // TODO: fetch the full body for this nid and display it
        console.log('Selected node:', nid);
    };

    // Props down (content), events up (the two handlers) — neither child
    // fetches or stores anything itself.
    return (
      <>
          <ContentType onSelect={handleTypeSelected} />
          <ContentList items={content} onSelect={handleNodeSelected} />
      </>
    );
}
