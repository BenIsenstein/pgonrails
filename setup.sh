#!/bin/bash

echo "Starting setup for local dev..."
echo "Safely creating .env file..."

SHOULD_CREATE_DOTENV=1

if [ -f ".env" ]; then
  echo "Found an existing .env file. Skipping .env setup..."
  SHOULD_CREATE_DOTENV=0
fi

if [ ! -f ".env.example" ]; then
  echo ".env.example file not found. Skipping .env setup..."
  SHOULD_CREATE_DOTENV=0
fi

if (( SHOULD_CREATE_DOTENV == 1)); then
  echo "Copying .env.example to .env..."
  cp .env.example .env
fi

echo "Safely creating local directory for volumes..."

mkdir -p ./volumes/db
mkdir -p ./volumes/storage

echo "Setup complete!"