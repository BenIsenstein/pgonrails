# PG On Rails

This is a Docker Compose setup for self-hosting Supabase. It is compatible with hosting on Railway. It is being closely maintained to support the full self-hosted feature set.

PG On Rails is **local-first** and provides an amazing developer experience. Run the entire stack locally in a way that is *transparent, configurable, and **versionable in code***. By tracking **every service in its own directory**, we can *co-locate config, app logic and build information (Dockerfile) for each service,* and utilize the modern deployment pattern of **watch paths in monorepos.**

My longterm vision is to make PG On Rails *the best strategy for bootstrapping, building and self-hosting Supabase projects, on the Railway platform and beyond.*

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/5ArOQi?referralCode=benisenstein&utm_medium=integration&utm_source=template&utm_campaign=generic)

## Required for local dev

- <a href="https://docs.docker.com/desktop/" target="_blank" rel="noopener noreferrer">Docker Desktop</a>&nbsp;&nbsp;<img src="https://docs.docker.com/assets/images/favicon.svg" alt="description" width="20" height="20" />
- <a href="https://supabase.com/docs/guides/local-development/cli/getting-started" target="_blank" rel="noopener noreferrer">Supabase CLI</a>&nbsp;&nbsp;<img src="https://avatars.githubusercontent.com/u/54469796?s=20" alt="description" width="20" height="20" />

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

## Deploy on Railway

1. Visit the [template page](https://railway.com/deploy/5ArOQi?referralCode=benisenstein&utm_medium=integration&utm_source=template&utm_campaign=generic) for PG On Rails and click "Deploy Now".

2. Use the Supabase self-hosting tool to [generate a JWT secret and keys](https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys) for your project. Add them to the input fields provided by the `Postgres` service.

![Deploy](https://github.com/BenIsenstein/pgonrails-media/blob/main/Deploy_Template_and_Input_JWTs.gif)

3. Wait for the project to deploy.

![Wait For Deployment](https://github.com/BenIsenstein/pgonrails-media/blob/main/Wait_For_Deployment.gif)

4. Eject from the template repo and Railway will create a fork for you on GitHub.

![Eject](https://github.com/BenIsenstein/pgonrails-media/blob/main/Eject.gif)

5. On each service, turn on `Wait For CI` and add `Watch Paths` to make CI/CD more targeted.

- A service's watch path should be its own `Root Directory`, which can be found at the top of the `Settings` panel, followed by `/**/*`. For example, the `Site` service builds from the `/site` directory within this repo, therefore its watch path is `/site/**/*`.
- You must manually do this on all 13 services in your project in order to configure Railway's CI/CD.

![CI and Watch Paths](https://github.com/BenIsenstein/pgonrails-media/blob/main/CI_and_Watch_Paths.gif)

6. Clone your repo and begin building features locally. Push to GitHub and watch Railway CI/CD work wonders!

![Begin Using Your App](https://github.com/BenIsenstein/pgonrails-media/blob/main/Begin_Using_Your_App.gif)

![Use Your App](https://github.com/BenIsenstein/pgonrails-media/blob/main/Use_your_app.gif)

![Use Supabase Studio](https://github.com/BenIsenstein/pgonrails-media/blob/main/Use_Supabase_Studio.gif)

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/5ArOQi?referralCode=benisenstein&utm_medium=integration&utm_source=template&utm_campaign=generic)

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

## Set up DB migration GitHub action

By default, the `Site` service runs its DB migrations on startup:

`ENTRYPOINT supabase db push ... && node server.js`

This way, the example web app is usable from the moment you deploy. However it's understandable if you'd rather move this function into a GitHub action. The code for that GitHub action is already included! Check it out in the `.github/workflows`. All you have to do is add a `DB_URL` secret to the Actions secrets for the repo, and it'll automatically run whenever new migrations are added to the `/site/supabase/migrations` folder.

1. Copy the `DB_PUBLIC_CONNECTION_STRING` from the `Postgres` service.

2. Visit your new repo and add the `DB_URL` secret to GitHub Actions secrets.

3. Manually run the DB migrations action.

![GH Action Migrate DB](https://github.com/BenIsenstein/pgonrails-media/blob/main/Add_GH_Actions_Secret_and_Run_Migrations.gif)

## No mail server yet, no problem

By default, mailing is disabled. Once a user signs up with their email and password, their email is "auto-confirmed" by the auth server and they are signed in.

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

**NOTE** - SMTP traffic on Railway is only allowed for the Pro Plan and above.
