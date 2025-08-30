# Supabase Docker

This is a minimal Docker Compose setup for self-hosting Supabase. It has been tweaked to be compatible with hosting on Railway. It is being closely maintained and updated as the Supabase platform adds new features!

## Get Started

Build the Docker compose stack

`docker compose build`

Setup local volumes for development (they are ignored by git and won't exist when you first clone the repo)

`chmod +x ./setup-volumes.sh && ./setup-volumes.sh`

Run the app locally

`docker compose up`

Visit the supabase studio at http://localhost:8000

Visit the frontend site at http://localhost:5173

Happy hacking!
