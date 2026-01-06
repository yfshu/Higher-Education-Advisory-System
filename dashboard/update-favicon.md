# How to Update the Favicon

The graduation cap icon (`icon.svg`) is already created. To make it appear:

## Option 1: Clear Browser Cache (Recommended)
1. Open your browser's developer tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or manually:
- **Chrome/Edge**: `chrome://settings/clearBrowserData` → Clear cached images
- **Firefox**: `Ctrl+Shift+Delete` → Clear cache
- **Safari**: `Cmd+Option+E`

## Option 2: Replace favicon.ico Manually
1. Convert your graduation cap image to `.ico` format using:
   - https://favicon.io/favicon-converter/
   - https://realfavicongenerator.net/
2. Replace `dashboard/src/app/favicon.ico` with your new file
3. Restart the dev server

## Option 3: Use Online Favicon Generator
1. Go to https://favicon.io/favicon-converter/
2. Upload your graduation cap image
3. Download the generated `favicon.ico`
4. Replace `dashboard/src/app/favicon.ico`
5. Restart the dev server

The `icon.svg` file is already configured and should work once the browser cache is cleared!

