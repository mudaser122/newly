import { API_BASE_URL } from '../api/config';

// Helper to handle fetch errors
const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error (${response.status}):`, errorBody);

        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            console.warn(`Rate limit hit! Retry-After: ${retryAfter}`);
            throw new Error(`API Error: 429 Too Many Requests (Retry-After: ${retryAfter})`);
        }

        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

// State to store current credentials
let currentAuth = {
    address: null,
    password: null,
    token: null,
    createdAt: null
};

const STORAGE_KEY = 'tempmail_session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export const mailService = {
    // Generate a new account and return the email address
    generateEmail: async () => {
        // Clear any previous session first
        localStorage.removeItem(STORAGE_KEY);
        // 1. Get available domains
        const domains = await fetchJson(`${API_BASE_URL}/domains`);
        if (!domains['hydra:member'] || domains['hydra:member'].length === 0) {
            throw new Error('No domains available');
        }
        const domain = domains['hydra:member'][0].domain;

        // 2. Generate random credentials (shorter)
        const randomStr = Math.random().toString(36).slice(2, 12);
        const address = `${randomStr}@${domain}`;
        const password = `Pwd${randomStr}!`;

        // 3. Create Account
        await fetchJson(`${API_BASE_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        // 4. Get Token (Login)
        const tokenData = await fetchJson(`${API_BASE_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        // Store credentials in memory and local storage
        const createdAt = Date.now();
        currentAuth = { address, password, token: tokenData.token, createdAt };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentAuth));

        return address;
    },

    // Get messages for the current account
    getMessages: async () => {
        if (!currentAuth.token) {
            throw new Error('Not authenticated');
        }

        const data = await fetchJson(`${API_BASE_URL}/messages?page=1`, {
            headers: { 'Authorization': `Bearer ${currentAuth.token}` }
        });

        // Normalize data to match our app's expected shape
        // Mail.tm returns: { "hydra:member": [ ... ] }
        return (data['hydra:member'] || []).map(msg => ({
            id: msg.id,
            from: `${msg.from.name} <${msg.from.address}>`,
            subject: msg.subject,
            date: msg.createdAt, // ISO string
            intro: msg.intro,
            seen: msg.seen
        }));
    },

    // Get details of a specific message
    getMessage: async (ignoredEmail, id) => {
        if (!currentAuth.token) {
            throw new Error('Not authenticated');
        }

        const msg = await fetchJson(`${API_BASE_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${currentAuth.token}` }
        });

        return {
            id: msg.id,
            from: `${msg.from.name} <${msg.from.address}>`,
            to: msg.to.map(t => t.address).join(', '),
            subject: msg.subject,
            date: msg.createdAt,
            // Mail.tm provides 'html' field directly in some endpoints or we might need to deduce it
            // Actually Mail.tm returns 'html' property for message details
            htmlBody: msg.html ? msg.html[0] : null, // It seems to be an array sometimes? Checking docs... 
            // Docs say "html": ["..."] usually.
            // Let's handle string or array.
            body: msg.text || msg.intro,
            attachments: msg.attachments || [] // Need to adapt attachment structure if we use it
        };
    },

    // Helper to re-authenticate if needed (not fully implemented but good practice)
    getCurrentAddress: () => currentAuth.address,

    // Try to restore session from local storage
    restoreSession: async () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        try {
            const session = JSON.parse(stored);
            const age = Date.now() - session.createdAt;

            // Check if session is valid (< 30 mins)
            if (age < SESSION_DURATION) {
                currentAuth = session;
                return session.address;
            } else {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
        } catch (e) {
            console.error('Failed to parse stored session', e);
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    },

    // Clear session explicitly
    clearSession: () => {
        currentAuth = { address: null, password: null, token: null, createdAt: null };
        localStorage.removeItem(STORAGE_KEY);
    }
};
