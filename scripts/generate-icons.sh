#!/bin/bash
echo "Generating icons from assets/icon.png..."
npx electron-icon-builder --input=assets/icon.png --output=build --flatten
mv build/icons/icon.icns build/ 2>/dev/null || true
mv build/icons/icon.ico build/ 2>/dev/null || true
rm -rf build/icons
echo "Icons generated successfully!"
