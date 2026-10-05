# Server HTTP minimal

Rulati `npm install`, apoi `npm start`. Serverul afiseaza URL-ul loopback.

Inspectati raspunsul de fisier:

```sh
curl -i "<base-url>/"
```

Inspectati ruta bazata pe query:

```sh
curl -i "<base-url>/api/greetings?name=Ada"
```

Implementati ruta lipsa bazata pe cale, apoi inspectati-o:

```sh
curl -i "<base-url>/api/greetings/Ada%20Lovelace"
```

Inspectati ruta de echo:

```sh
curl -i -X POST -H 'content-type: application/json' -d '{"clue":"crumbs"}' "<base-url>/api/echo"
```

Thunder Client este o a doua verificare utila: trimiteti o cerere `GET` catre
`/`, o cerere `GET` catre `/api/greetings?name=Ada`, o cerere `GET` catre
`/api/greetings/Ada%20Lovelace` si o cerere JSON `POST` catre `/api/echo`.

Rulati `npm test` pentru toate verificarile sau separat scripturile
`test:baseline`, `test:objective` si `test:regression`.
