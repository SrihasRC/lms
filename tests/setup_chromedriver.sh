#!/bin/bash

# Script to download the correct ChromeDriver version for Chrome 142

echo "Downloading ChromeDriver for Chrome 142..."

# Create drivers directory if it doesn't exist
mkdir -p drivers

# Download ChromeDriver 142
cd drivers
wget -q "https://storage.googleapis.com/chrome-for-testing-public/142.0.7444.61/linux64/chromedriver-linux64.zip"

# Unzip
unzip -q chromedriver-linux64.zip

# Move the binary
mv chromedriver-linux64/chromedriver .
chmod +x chromedriver

# Clean up
rm -rf chromedriver-linux64 chromedriver-linux64.zip

echo "✅ ChromeDriver installed at: $(pwd)/chromedriver"
echo "Version:"
./chromedriver --version
