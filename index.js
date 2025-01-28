import Settings from "./Settings";

const metadata = FileLib.read("SpotPlayingLite", "metadata.json");
const version = JSON.parse(metadata).version;

let currentSongTitle = null;

let overlayX = -200;
let targetX = 5;
let animationSpeed = 5;

let isHovering = false;

function displaySongTitle(songTitle, x, isHovering) {
    if (!songTitle) return;

    const formattedTitle = Settings.npSettingsSong.replace("{song}", songTitle.name);
    const formattedArtist = songTitle.artists && songTitle.artists.length > 0 
        ? Settings.npSettingsArtist.replace("{artist}", songTitle.artists.join(", "))
        : "Local File";

    const padding = 10;
    const titleWidth = Renderer.getStringWidth(formattedTitle);
    const artistWidth = Renderer.getStringWidth(formattedArtist);

    const boxWidth = Math.max(titleWidth, artistWidth) + padding * 2;

    const lineHeight = 10;
    let boxHeight = 2 * lineHeight + padding * 2;

    const boxX = x;
    const boxY = 5;

    const bgColor = Settings.npBGColor;

    Renderer.drawRect(Renderer.color(bgColor.getRed(), bgColor.getGreen(), bgColor.getBlue(), Settings.npBGOpacity), boxX, boxY, boxWidth, boxHeight);

    Renderer.drawString(formattedTitle, boxX + padding, boxY + padding, Settings.npTextShadow);
    Renderer.drawString(formattedArtist, boxX + padding, boxY + padding + lineHeight, Settings.npTextShadow);

    if (isHovering && Settings.npHover) {
        const additionalText = "&8Click to open Spotify.";
        const additionalTextWidth = Renderer.getStringWidth(additionalText);
        const additionalTextX = boxX + (boxWidth - additionalTextWidth) / 2;
        const additionalTextY = boxY + boxHeight + 10;

        Renderer.drawString(additionalText, additionalTextX, additionalTextY, Settings.npTextShadow);
    }
}

function checkHover(x, y, width, height) {
    const mouseX = Client.getMouseX();
    const mouseY = Client.getMouseY();
    return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
}

function openSpotify() {
    try {
        const process = java.lang.Runtime.getRuntime().exec("cmd /c start shell:AppsFolder\\SpotifyAB.SpotifyMusic_zpdnekdrzrea0!Spotify");
        const exitCode = process.waitFor();
        if (exitCode !== 0) {
            try {
                java.awt.Desktop.getDesktop().browse(new java.net.URI("https://open.spotify.com"));
            } catch (e) {
                ChatLib.chat(`${Settings.chatPrefix}&cFailed to open Spotify. &4Check console for errors.`);
                console.log(`SpotPlayingLite Error: ${e}`);
            }
        }
    } catch (e) {
        try {
            java.awt.Desktop.getDesktop().browse(new java.net.URI("https://open.spotify.com"));
        } catch (e) {
            ChatLib.chat(`${Settings.chatPrefix}&cFailed to open Spotify. &4Check console for errors.`);
            console.log(`SpotPlayingLite Error: ${e}`);
        }
    }
}

function getSpotifySongTitle() {
    try {
        const process = java.lang.Runtime.getRuntime().exec("powershell.exe -Command \"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; (Get-Process spotify | Where-Object {$_.mainWindowTitle} | select -first 1).mainWindowTitle\"");
        const reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream(), "UTF-8"));
        let line;
        let output = "";
        while ((line = reader.readLine()) != null) {
            output += line;
        }
        reader.close();
        process.waitFor();
        const windowTitle = output.trim();

        if (windowTitle.includes(" - ")) {
            const [artist, title] = windowTitle.split(" - ");
            currentSongTitle = {
                name: title,
                artists: [artist]
            };
        } else if (windowTitle === "Advertisement") {
            currentSongTitle = {
                name: windowTitle,
                artists: ["It will be over soon.. or not."]
            };
        } else if (windowTitle === "Spotify Free" || windowTitle === "Spotify Premium" || windowTitle === "AngleHiddenWindow") {
            currentSongTitle = {
                name: "Spotify",
                artists: ["Track is currently paused."]
            };
        } else {
            currentSongTitle = {
                name: windowTitle,
                artists: ["Local File"]
            };
        }
    } catch (e) {
        console.error(`Error executing PowerShell command: ${e}`);
    }
}

function updateSongTitlePeriodically() {
    getSpotifySongTitle();
    setTimeout(updateSongTitlePeriodically, Settings.checkRate);
}

updateSongTitlePeriodically();

register("renderOverlay", () => {
    if (currentSongTitle && Settings.npEnabled) {
        if (overlayX < targetX) {
            overlayX += animationSpeed;
            if (overlayX > targetX) overlayX = targetX;
        }
    } else {
        if (overlayX > -200) {
            overlayX -= animationSpeed;
            if (overlayX < -200) overlayX = -200;
        }
    }
    if (overlayX > -200) {
        isHovering = false;
        if (currentSongTitle) {
            const boxWidth = Math.max(Renderer.getStringWidth(`&f${currentSongTitle.name}`), Renderer.getStringWidth(`&7${currentSongTitle.artists.join(", ")}`)) + 20;
            const boxHeight = 2 * 10 + 20;
            isHovering = checkHover(overlayX, 5, boxWidth, boxHeight);
        }
        displaySongTitle(currentSongTitle, overlayX, isHovering);
    }
});

register("clicked", (mouseX, mouseY, button, isPressed) => {
    if (isPressed && isHovering && Settings.npHover) {
        openSpotify();
    }
});

register("command", (arg) => {
    if (!arg) return Settings.openGUI();

    arg = arg.toLowerCase();
    
    if (arg == "copy") {
        ChatLib.chat(`${Settings.chatPrefix}&fCopied &7${currentSongTitle.name} &fto clipboard.`);
        ChatLib.command(`ct copy ${currentSongTitle.name}`, true);
    } else if (arg === "open") {
        openSpotify();
    } else if (arg === "version" || arg === "ver") {
        ChatLib.chat(`${Settings.chatPrefix}&fVersion: &7${version}&f.`);
    } else {
        ChatLib.chat(`${Settings.chatPrefix}&cInvalid command. Try &7/spotify <copy|open|version>&c.`);
    }
}).setName("spotplaying").setAliases("spotifyplaying", "spot", "spotify", "playingspot", "playingspotify");

ChatLib.chat(`\n&8[&a&lSpot&2&oPlaying&7Lite&8] &f${version} &7by &btdarth &a&lloaded. &7(/spotify).\n`);