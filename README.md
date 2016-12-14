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
