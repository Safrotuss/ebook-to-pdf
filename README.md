# E-Book to PDF Converter
[한국어](docs/README.ko.md) | [日本語](docs/README.ja.md) | [中文](docs/README.zh.md)

A desktop application that automatically captures pages from E-Book viewers and converts them to PDF.

## Features
- Automatic screen region capture
- Automatic page turning
- PDF conversion
- Adjustable capture speed
- Real-time progress display
- Multi-platform support (macOS, Windows)

## Tech Stack
- Electron
- React
- TypeScript
- Sharp (Image processing)
- PDFKit (PDF generation)

## Installation
```bash
npm install
```

## Development
```bash
npm run dev
```

In a separate terminal.
```bash
npm start
```

## Build
### Build for both macOS & Windows
```bash
npm run package
```

### Build for macOS only
```bash
npm run package:mac
```

### Build for Windows only
```bash
npm run package:win
```

Build output will be in the `release` folder.

## How to Use
1. Open your E-Book viewer and navigate to the first page
2. Click to set the top-left coordinate of the capture area
3. Click to set the bottom-right coordinate of the capture area
4. Enter the total number of pages
5. Enter the PDF file name
6. Adjust capture speed (default: 1000ms)
7. Click "Create PDF" button

## Important Notes
- The E-Book viewer must support page navigation using the right arrow key
- The capture area must not exceed the viewer boundaries
- Large page counts may take considerable time
- Do not perform other tasks during capture
- For personal use only

## System Requirements
### macOS
- macOS 10.14 or later
- Screen Recording permission required
### Windows
- Windows 10 or later
- PowerShell 5.0 or later

## Legal Notice
This program is created for personal learning and use purposes only.
Sharing or commercial use of generated PDF files may violate copyright laws.
All responsibility lies with the user.

## License
Apache License 2.0

## Author
Created by efforthye

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
