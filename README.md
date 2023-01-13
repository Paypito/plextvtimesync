# plextvtimesync
Sync Plex history with TVTime
## How to run Project
Install dependencies
```bash
npm install
```
Run project
```bash
npm start
```
## Configuration
Update `src\config.ts` with your own configuration or use environment variable

## Docker

Build docker image
```
docker build -t plextvtimesync .
```

Run image 

```bash
docker run -d -e TVTIME_SYMFONY=YOUR_KEY -e TVTIME_TVST_REMEMBER=YOUR_KEY -e PLEX_BASE_URL=http://YOUR_BASE_URL -e PLEX_TOKEN=YOUR_TOKEN --name plextvtimesync plextvtimesync
```