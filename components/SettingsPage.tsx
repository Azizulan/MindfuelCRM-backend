import React, { useState, useEffect } from 'react';
import { getApiCredentials, saveApiCredentials } from '../services/packzyApiService';
import { CogIcon } from './icons/CogIcon';

const SettingsPage: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const creds = getApiCredentials();
        if (creds) {
            setApiKey(creds.apiKey);
            setSecretKey(creds.secretKey);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            saveApiCredentials({ apiKey, secretKey });
            setSaveStatus('success');
        } catch {
            setSaveStatus('error');
        } finally {
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">API Settings</h2>

            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 max-w-2xl">
                <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <CogIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-700">Packzy API Configuration</h3>
                        <p className="text-sm text-slate-600 mt-1">
                            Enter your API and Secret keys from your Packzy Courier dashboard to enable order creation and tracking.
                        </p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-slate-700">Api-Key</label>
                        <input
                            type="password"
                            id="api-key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your API Key"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="secret-key" className="block text-sm font-medium text-slate-700">Secret-Key</label>
                        <input
                            type="password"
                            id="secret-key"
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your Secret Key"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-end space-x-4">
                         {saveStatus === 'success' && <p className="text-sm text-green-600">Credentials saved successfully!</p>}
                         {saveStatus === 'error' && <p className="text-sm text-red-600">Failed to save credentials.</p>}
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Save Credentials
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;