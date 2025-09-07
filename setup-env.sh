echo "Safely creating .env file..."

if [ -f ".env" ]; then
  echo "Found an existing .env file."
  exit 1
fi

if [ ! -f ".env.example" ]; then
  echo ".env.example file not found. Skipping .env setup..."
  exit 1
fi

echo "Copying .env.example to .env..."
cp .env.example .env
echo "Setup complete!"