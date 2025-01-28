import { @Vigilant, @TextProperty, @ParagraphProperty, @ColorProperty, @ButtonProperty, @SwitchProperty, @ColorProperty, @CheckboxProperty, @SelectorProperty, @PercentSliderProperty, @SliderProperty, Color } from 'Vigilance';

const metadata = FileLib.read("SpotPlayingLite", "metadata.json");
const version = JSON.parse(metadata).version;

@Vigilant("SpotPlayingLite", `§a§lSpot§2§oPlaying§7Lite §f${version} §7by §btdarth`)

class Settings {
    npDragGui = new Gui();

    // Settings

    @TextProperty({
        name: "Chat Prefix",
        description: "What do you want the &bChat Prefix&7 to be?",
        category: "Settings",
        placeholder: "Enter Chat Prefix..",
        subcategory: "Other"
    })
    chatPrefix = "&8[&a&lSpot&2&oPlaying&7Lite&8] &f";

    @TextProperty({
        name: "Check Rate",
        description: "&7The time in milliseconds the currently playing song will be checked.",
        category: "Settings",
        placeholder: "Enter Time..",
        subcategory: "Other"
    })
    checkRate = "10000";

    // Now Playing

    // - Toggles -

    @CheckboxProperty({
        name: "Overlay Enabled",
        description: "&7Toggles if you are able to see Now Playing overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npEnabled = true;

    @CheckboxProperty({
        name: "Open Spotify on Click",
        description: "&7Toggles if you are able to open Spotify by clicking on the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npHover = true;

    // Configuration

    @ColorProperty({
        name: "Overlay Color",
        description: "&7The background color of the overlay.",
        category: "Now Playing",
        subcategory: "Configuration"
    })
    npBGColor = new Color(0, 0, 0);

    @SliderProperty({
        name: "Overlay Opacity",
        description: "&7The opacity of the overlay.",
        category: "Now Playing",
        subcategory: "Configuration",
        min: 0,
        max: 255
    })
    npBGOpacity = 100;

    @CheckboxProperty({
        name: "Text Shadows",
        description: "&7Toggles if all text on the overlay have shadows.",
        category: "Now Playing",
        subcategory: "Configuration"
    })
    npTextShadow = true;

    constructor() {
        this.initialize(this);
        this.setCategoryDescription("Settings", "&7A module by &atdarth &7and &2Github Copilot&7. &8(gee, thanks).");
    }
}

export default new Settings();
