// Imports
import {createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {ContentBrowser} from './components/ContentBrowser';

const contentEl = document.getElementById('front-content-browser');
if (contentEl) {
    console.log(contentEl)
    createRoot(contentEl).render(createElement(ContentBrowser));
}
