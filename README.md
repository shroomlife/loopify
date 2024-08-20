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

## Deployment auf `shroom001`

Das Docker-Image läuft auf `shroom001`. Stelle sicher, dass du die richtige Konfiguration für den Container auf diesem Server verwendest.
