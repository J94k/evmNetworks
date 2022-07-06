# EMV networks

Start the script to create initial values:

```sh
npm run update
```

If you had `networks.json` before, the script compaire it and save difference into `diff.json`.
If you have `.env` parameters, the script also send difference to a Telegram chat.

- `networks.json`: array of filtered networks. Excluded if: `id`, `name`, `title` or `chain` key is excluded (internal parameters); without `rpc`, `explorers` or `infoURL` key; with **API** key.
- `sources.json`: array of sources (mostly domain names). Created from `networks.json` and excluded if: none of RPCs are available or we have problems with requests.
- `diff.json`: difference between previous and new versions of `networks.json` (created only if we have `networks.json` and some difference).
- `logs.txt`: errors here.
