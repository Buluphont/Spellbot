[![Discord](https://discordapp.com/api/guilds/258287716091953153/embed.png)](https://discord.gg/KWsvFGG) [![DavidDep](https://david-dm.org/Buluphont/Spellbot/status.svg?style=flat-square)](https://david-dm.org/Buluphont/Spellbot) [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/Buluphont/Spellbot/blob/master/LICENSE)

# Spellbot
A Discord bot leveraging [Discord.js](https://github.com/hydrabolt/discord.js/) to serve up Dungeons & Dragons 5th Edition resources.

# Installation
Requires Node.js >= 7.0.0 (makes use of async/await, so `--harmony` flag is required)

Requires MongoDB server for most anything useful.

Create a `config.json` file in `./` in the same fashion as the provided `config.json.example`.

Be sure to `npm install` to get dependencies, then...

Update database with:
`npm run db`

Finally,
`npm start` (or optionally -- and preferably -- use something like `pm2` to run your bot).

# Disclaimer
The contents of the `assets/` directory are NOT mine. They are taken from [some other group's kind, public work.](https://www.dropbox.com/sh/hiavsiegq28xd7u/AABcMGhKcr8CYgeKaHK1ZDzJa?dl=0)
