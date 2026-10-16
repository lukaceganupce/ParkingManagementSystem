# ParkingManagementSystem

Parkoid – software for managing parking areas. Documentation is in `docs/`.

## Local development

### Requirements

- Docker with Docker Compose (Docker Desktop on Windows/macOS)

### Project layout

| Path | Description |
|------|-------------|
| `src/fe/src` | Frontend (HTML, CSS, JavaScript, Web Components) |
| `src/be/src` | Backend (Node.js, Express) |
| `docker/docker-compose.yaml` | Local environment definition |
| `docker/nginx/` | nginx configs of the frontend and backend web servers |
| `docker/postgres/initdb/initdb.sql` | Database initialization (runs on first start only) |

### Configuration (`docker/.env`)

Create the file `docker/.env` yourself before the first start. It is **not part of git** for security reasons (it holds passwords), so every developer has to create their own copy. Template:

```env
POSTGRES_DB=parkoid
POSTGRES_USER=parkoid_user
POSTGRES_PASSWORD=change_me
APP_DB_USER=parkoid_user_app
APP_DB_PASSWORD=parkoid_user_pwd
```

If the file is missing, docker compose falls back to the defaults shown above. `APP_DB_USER` and `APP_DB_PASSWORD` must match the role created in `docker/postgres/initdb/initdb.sql`.

### Start the system

From the repository root:

```powershell
docker compose -f docker\docker-compose.yaml up --build -d
```

The first start builds the Node.js image and installs npm dependencies into the `node_modules` volume, so it can take a while. Follow it with `docker compose -f docker\docker-compose.yaml logs -f app`.

| Service | URL / port | Description |
|---------|-----------|-------------|
| frontend-server | http://localhost:8080 | Frontend web server (`index.html`, static assets) |
| backend-server | http://localhost:8081/api/ | Backend web server, reverse proxy to the Node.js app |
| app | internal `app:3000` | Node.js + Express with nodemon |
| db | internal `db:5432` | PostgreSQL |

### Frontend pages

Open http://localhost:8080 (redirects to `home.html`). Pages: `home.html`, `sign_up.html`, `sign_in.html`, `forgot_password.html`, `reset_password.html`, `account.html`, `dashboard.html` (operator only).

- `src/fe/src/js/main.js` – common bootstrap, `components/` – Web Components (`app-header`, `app-footer`, `app-modal`), `pages/` – logic of each page, `i18n/` – translations (Česky, English), `icons.js` – SVG icons, `api.js` – REST client.
- **Mock API:** the backend does not implement the API yet, so `js/config.js` has `USE_MOCK = true` and `js/mock-api.js` simulates the backend in the browser (localStorage). Demo accounts: `operator@parkoid.local` / `operator123` (operator), `driver@parkoid.local` / `driver123` (driver). Demo discount codes: `WELCOME10`, `MINUS20`. Any new license plate is treated as having entered 90 minutes ago. To reset the mock data, delete `parkoid_mock_db` in the browser local storage. Set `USE_MOCK = false` to call the real backend at `API_BASE`.
### Source code outside the container

Sources are **not copied** into the images, they are mounted from the host:

- `src/fe/src` is mounted into the frontend nginx. Changes are visible after a browser refresh.
- `src/be/src` is mounted into the `app` container (`/usr/src/app`). **nodemon** watches the files and restarts the app automatically on every change (`-L` polling is used so it works with Windows bind mounts). If needed, restart manually with `docker restart parkoid-app`.
- `node_modules` lives in a named Docker volume, so host and container dependencies do not collide. `npm install` runs on every container start. After changing `package.json` you can also run `docker exec -it parkoid-app npm install`.

### Database

- Defaults (override with environment variables `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `APP_DB_USER`, `APP_DB_PASSWORD`): database `parkoid`, owner `parkoid_user`, application role `parkoid_user_app`.
- `docker/postgres/initdb/initdb.sql` runs only when the `pgdata` volume is empty. After changing it, recreate the database: `docker compose -f docker\docker-compose.yaml down -v` and start again (this deletes all data).
- Open a SQL shell: `docker exec -it parkoid-db psql -U parkoid_user -d parkoid`

### Useful commands

```powershell
docker compose -f docker\docker-compose.yaml ps          # status
docker compose -f docker\docker-compose.yaml logs -f app # logs of a service
docker compose -f docker\docker-compose.yaml down        # stop and remove containers
docker compose -f docker\docker-compose.yaml down -v     # also remove volumes (database, node_modules)
```
