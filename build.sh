#!/bin/bash
set -e

npm install
npm run lint
npm run compile
