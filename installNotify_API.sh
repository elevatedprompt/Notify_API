#!/bin/bash
# Install Notify API
sudo npm install
sudo pm2 start index.js --name epstack-Notify-API
