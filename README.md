# Web-Crawlers

An interactive browser extension that sends animated creatures roaming over web pages and interacting with their text. Inspired by and credited to [Slava Rybin](https://www.rybinfx.com/). Open-source contributions are welcome!

## Download

1. Open this repository on GitHub.
2. Select **Code** > **Download ZIP**.
3. Extract the downloaded ZIP file. Do not try to load the ZIP itself.
4. Find the extension folder: it is the folder that contains `manifest.json`, `content.js`, and `popup.html`. In the repository, this is `crawlers-extension/crawlers-extension`.

You can also use Git to download the project:

```sh
git clone https://github.com/carlandrei47-boop/Web-Crawlers.git
```

Then open the extracted or cloned extension folder in the browser as described below.

## Install

### Chrome, Microsoft Edge, and other Chromium browsers

1. Open the browser's extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
2. Turn on **Developer mode**.
3. Select **Load unpacked**.
4. Choose the extracted `crawlers-extension/crawlers-extension` folder (the one containing `manifest.json`).
5. Pin **Crawlers** to the toolbar if you want quick access to its controls.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **This Firefox** > **Load Temporary Add-on…**.
3. In the extracted extension folder, select `manifest.json`.

Firefox temporary add-ons are removed when Firefox closes. Load the add-on again after restarting the browser.

## Use

Select the Crawlers icon in the browser toolbar to open its controls:

- Turn the crawler on or off, and choose a creature and picture power.
- Pause or resume the animation.
- Choose reduced effects for slower devices.
- Select **Reset page effects** to undo visual changes on the current page.

Click the web page to trigger the active creature's special move. Choose **Stick gang vs. endless waves** for battles against waves and bosses, or **Rift Mason (builds platforms)** to build defenses. Settings are saved. These effects change the page visually; refreshing the page also clears them.

## Troubleshooting

- Make sure you selected the extension folder containing `manifest.json`, not the downloaded ZIP or the outer repository folder.
- If you move or edit the extension files, return to the extensions page and select **Reload**.
- Browser-internal pages and some restricted pages do not allow extensions to run.

## Contributing

Contributions and bug reports are welcome. Please open an issue to discuss larger changes before submitting a pull request.
