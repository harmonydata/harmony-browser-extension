# Send to Harmony Chrome Extension

This Chrome extension allows you to send selected text to Harmony with a right-click. For PDFs, use the popup to paste your selected text.

## Features

- Right-click to send selected text to Harmony
- Popup interface for pasting text from PDFs
- Seamless integration with Harmony Data platform

## Development

The extension is built using vanilla JavaScript and Chrome Extension APIs. The main components are:
- `manifest.json`: Extension configuration
- `background.js`: Service worker for handling context menu and messaging
- `popup.html/js`: UI for the extension popup
- `icons/`: Extension icons in various sizes

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/harmonydata/harmonydata-chrome-extension.git
   cd harmonydata-chrome-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension directory

## Publishing

The extension is automatically published to the Chrome Web Store when changes are pushed to the main branch. This is handled by GitHub Actions.

### Setting up Chrome Web Store API Credentials

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Create a new item or select your existing extension
3. Get your Extension ID from the URL (it's the long string of letters and numbers)
4. Go to the "API Access" tab
5. Create a new API key:
   - Click "Create new credentials"
   - Choose "Chrome Web Store API"
   - Save the Client ID and Client Secret

### Configuring GitHub Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

- `EXTENSION_ID`: Your Chrome extension ID
- `CLIENT_ID`: Chrome Web Store API Client ID
- `CLIENT_SECRET`: Chrome Web Store API Client Secret
- `REFRESH_TOKEN`: OAuth 2.0 Refresh Token

To get the refresh token:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to APIs & Services > Credentials
4. Create an OAuth 2.0 Client ID
5. Use the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) to get a refresh token:
   - Set the OAuth 2.0 configuration
   - Authorize APIs using your client ID
   - Exchange authorization code for tokens
   - Copy the refresh token

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Manual Testing

[Google instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world)

### TL:DR

Open chrome extensions settings: "chrome://extensions"
Toggle "Developer mode"
Click the new "Load unpacked" button
Select the chrome folder.
When the extension appears is it most useful to pin it to allow the popover features
