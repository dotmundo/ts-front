// Entry point. Mounts the React app into <div id="app"> from index.html.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(createElement(App));
}
