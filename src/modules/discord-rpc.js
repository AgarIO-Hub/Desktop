const RPC = require('discord-rpc');
const CONFIG = require('../config.json');
const clientId = '1233549213405675611';

RPC.register(clientId);

const rpc = new RPC.Client({ transport: 'ipc' });
const rpc_pages = require('./rpc-pages.json');

let currentPage = null;
let previousPage = null;

let activity = {
    details: 'Playing AgarIO Hub',
    state: 'Loading...',
    startTimestamp: new Date(),
    largeImageKey: 'logo',
    largeImageText: 'AgarIO Hub',
    instance: false
};

rpc.on('ready', () => {
    rpc.setActivity(activity);
});

rpc.login({ clientId }).catch(console.error);

function updateActivity(newData) {
    activity = { ...activity, ...newData };
    if (rpc) rpc.setActivity(activity);
}

function pageToActivity(page, fromIdle = false) { // Someone please fix this mess, I feel like it could be a lot cleaner
    try {
        if (!page) {
            return updateActivity({
                details: 'Idling...',
                state: "Idling...",
                startTimestamp: activity.startTimestamp,
                largeImageKey: 'logo',
                largeImageText: 'AgarIO Hub',
                instance: false
            });
        }

        if (page.startsWith('file://')) return;

        page = page.split('agariohub.xyz')[1];
        console.log(page);
        const pageData = rpc_pages[page];

        if (pageData) {
            updateActivity({
                details: pageData.details || activity.details,
                state: pageData.state || activity.state,
                largeImageKey: pageData.largeImageKey || activity.largeImageKey,
                largeImageText: pageData.largeImageText || activity.largeImageText,
                startTimestamp: activity.startTimestamp
            });
        } else {
            const profilePages = [
                { match: '/user/', details: 'Viewing Profile', format: name => name },
                { match: '/mall/', details: 'Viewing Profile', format: name => `${name}'s Mall` },
                { match: '/inventory/', details: 'Viewing Profile', format: name => `${name}'s Inventory` }
            ];

            for (const { match, details, format } of profilePages) {
                if (page.includes(match)) {
                    const name = page.split(match)[1];
                    updateActivity({
                        details,
                        state: format(name),
                        largeImageKey: 'logo',
                        largeImageText: 'AgarIO Hub',
                        startTimestamp: activity.startTimestamp
                    });
                    return;
                }
            }

            if (page.startsWith('/login') || page.startsWith('/register')) {
                updateActivity({
                    details: 'Logging In',
                    state: 'AgarIO Hub',
                    largeImageKey: 'logo',
                    largeImageText: 'AgarIO Hub',
                    startTimestamp: activity.startTimestamp
                });
                return;
            }

            if ((page.match(/\//g) || []).length === 1) {
                page = page.replace(/^\//, '').replace(/-/g, ' ');
                page = page.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                const words = page.split(' ');
                const lastWord = words[words.length - 1];

                if (!isNaN(lastWord)) {
                    words[words.length - 1] = `#${lastWord}`;
                    page = words.join(' ');
                }

                updateActivity({
                    details: 'Playing AgarIO Hub',
                    state: page,
                    largeImageKey: 'logo',
                    largeImageText: 'AgarIO Hub',
                    startTimestamp: activity.startTimestamp
                });
            } else {
                updateActivity({
                    details: 'Playing AgarIO Hub',
                    state: 'Unknown Page',
                    largeImageKey: 'logo',
                    largeImageText: 'AgarIO Hub',
                    startTimestamp: activity.startTimestamp
                });
            }
        }
    } catch (error) {
        console.error('RPC error:', error);
    }
}

setInterval(() => {
    if (currentPage !== previousPage) {
        pageToActivity(currentPage);
        previousPage = currentPage;
    }
}, 5000);

function setPage(page) {
    currentPage = page;
}

module.exports = {
    setPage,
    updateActivity,
    pageToActivity
};