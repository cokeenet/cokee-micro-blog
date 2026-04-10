import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { HeroUIProvider } from '@heroui/system';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router';
import App from './App';
import './index.css';

function AppProviders() {
    const navigate = useNavigate();

    return (
        <HeroUIProvider navigate={navigate}>
            <ThemeProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ThemeProvider>
        </HeroUIProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppProviders />
        </BrowserRouter>
    </React.StrictMode>
);
