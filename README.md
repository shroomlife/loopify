# loopify

## Setup mit Bun

Installiere die Abhängigkeiten mit [Bun](https://bun.sh/):

```bash
bun install
```

## Development Server

Starte den Entwicklungsserver auf `http://localhost:3000`:

```bash
bun run dev
```

## Produktion und Docker Image bauen und pushen

Führe den folgenden Befehl aus, um die Applikation für die Produktion zu bauen und das Docker-Image zu erstellen sowie in eine Registry zu pushen:

```bash
bun run pb:dev
```

Dieser Befehl erledigt die folgenden Schritte:

1. Erstellen des Produktions-Builds der Applikation.
2. Bauen des Docker-Images.
3. Pushen des Docker-Images zu deiner konfigurierten Registry.

## Wichtige Umgebungsvariablen

Damit die App korrekt funktioniert, müssen folgende Umgebungsvariablen gesetzt und an den Container gehangen werden:

- `NUXT_SPOTIFY_CLIENT_ID`
- `NUXT_SPOTIFY_CLIENT_SECRET`
- `NUXT_PUBLIC_SPOTIFY_REDIRECT_URL`

Diese Variablen werden für die Authentifizierung mit Spotify benötigt.

Um diese einzurichten:

1. Erstelle eine Spotify App im [Spotify Developer Dashboard](https://developer.spotify.com/).
2. Setze `NUXT_SPOTIFY_CLIENT_ID` und `NUXT_SPOTIFY_CLIENT_SECRET` mit den entsprechenden Werten aus der Spotify App.
3. Stelle sicher, dass `NUXT_PUBLIC_SPOTIFY_REDIRECT_URL` korrekt konfiguriert ist und mit der in der Spotify App angegebenen Redirect-URL übereinstimmt.
