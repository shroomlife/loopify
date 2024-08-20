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

## Wichtige Umgebungsvariable

Damit die App korrekt funktioniert, muss die Umgebungsvariable `SPOTIFY_REDIRECT_URL` gesetzt sein. Diese URL wird für die Authentifizierung mit Spotify benötigt.

Um diese einzurichten, musst du eine Spotify App erstellen. Gehe dazu zu [Spotify Developer Dashboard](https://developer.spotify.com/) und erstelle eine neue App. Stelle sicher, dass die `SPOTIFY_REDIRECT_URL` in den Einstellungen der Spotify App korrekt konfiguriert ist.
