// App.tsx — the root component.
//
// The page is composed from "region" components. Each region is
// self-contained: it fetches its own content from Drupal and renders it.
// <Header> is the reference implementation — copy its shape for the rest.
import { Header } from './components/Header';

export function App() {
    return (
        <>
            <Header />

            {/*
              Add more regions here, one component each:

                <Nav />       — a Drupal menu
                <Content />   — the current node's fields (JSON:API)
                <Sidebar />   — Drupal blocks
                <Footer />    — a Drupal block and/or menu

              Build each the way Header is built:
                1. a JSON endpoint on the Drupal side
                2. a typed `getJson<T>()` call in a container component
                3. presentational child components for the markup
            */}
        </>
    );
}
