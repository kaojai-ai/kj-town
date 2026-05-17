import * as RAPIER from '@dimforge/rapier3d-compat';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './style.css';

await RAPIER.init();

const root = document.getElementById('root');

if (!root) {
    throw new Error('Root element was not found.');
}

createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
