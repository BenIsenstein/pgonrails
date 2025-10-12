# PG On Rails

This is a Docker Compose setup for self-hosting Supabase. It has been tweaked to be compatible with hosting on Railway. It is being closely maintained and updated as the Supabase platform adds new features.

My longterm vision is to make PG On Rails *the best strategy for bootstrapping, building and self-hosting Supabase projects, on the Railway platform and beyond.*

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/5ArOQi?referralCode=Hwex-j&utm_medium=integration&utm_source=template&utm_campaign=generic)

## Get Started

Setup environment and volumes

`./setup.sh`

Run the app locally

`docker compose up`

Visit the supabase studio at http://localhost:8000

Visit the frontend site in dev mode at http://localhost:5173

Happy hacking!

## Features

### Sane and simple defaults

Get working on real application features in seconds. We go the extra mile to make default configuration minimal while still covering everything needed to run out-of-the-box. Avoid drowning in config, and opt in to more hackability as needed.

### Add your app logic, deploy seamlessly

Every service gets its own directory, so watchpaths just work. Add new functions, configuration files, migrations, and anything else to a service's repo, commit your work, and Railway (or your CI/CD of choice) will trigger a new build.

### Your frontend, included in the stack

Reduce context-switching and host as much of your stack as possible on the same platform. For NextJS, Django, htmx or any server-rendered frontend, get fast and secure access to Supabase data APIs via the shared internal network.

### Full control over your application

For the hackers. Configure every aspect of your Supabase application and version it in code:
- Email templates
- Third-party auth providers
- Environment variables
- Networking settings
- Railway config-as-code

## Frontend included with seamless dev mode

We included a frontend app in the stack and named it `site`. The frontend site is a NextJS app built with `create-next-app`, `tailwindCSS` and `shadcn/ui`. It includes basic auth functionality so you can begin building user experiences out of the box.

### Separate Dockerfiles for development and deployment

The project is setup so that running the Docker Compose stack locally **runs the site in dev mode**. See how this is possible in `docker-compose.yml`:

```yml
  services:
    site:
      build:
        context: ./site
        dockerfile: dev.Dockerfile
      volumes:
        - ./site:/app
```

The local development experience, which runs on Docker Compose, points to a `dev.Dockerfile` in the `site` repo. This dockerfile runs the NextJS dev server. For production, however, Railway looks for a `Dockerfile` by default (no `dev` prefix), and will deploy using the `Dockerfile` which builds and serves the optimized site.

The other strategy which enables smooth local development inside Docker, is mounting the entire `site` directory as a volume inside the dev container (`volumes: - ./site:/app`). This exposes the codebase from your local filesystem inside the container, where the dev server can pick up any changes and deliver that hot-reload experience we all love.

## Setup mailing fast

The auth server requires an SMTP server to send transactional emails. In my experience, the quickest way to get up and running in both **local** and **non-production cloud** environments, is through a gmail account with an app password.

Log in to the Google account you want all transactional emails to come from. Visit the following link to [create a Google app password.](https://myaccount.google.com/u/4/apppasswords)

Make sure the email signup and SMTP environment variables are set:

```Dotenv
    GOTRUE_MAILER_AUTOCONFIRM=false
    GOTRUE_SMTP_ADMIN_EMAIL=johndoe@gmail.com
    GOTRUE_SMTP_USER=myapp@gmail.com
    GOTRUE_SMTP_PASS="abcd efgh ijkl mnop"
    GOTRUE_SMTP_HOST=smtp.gmail.com
    GOTRUE_SMTP_PORT=587
    GOTRUE_SMTP_SENDER_NAME: "PG On Rails"
```
