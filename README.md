# holly-fsm

holly-fsm SDK

## Quick Start

```bash
npm install
npm run build
npm run test
```

## Usage

```ts
import { createClient } from 'holly-fsm';

const client = createClient({ endpoint: 'https://api.example.com' });

console.log(client.ping());
```

## Scripts

- `clean` – remove the compiled `dist/` folder.
- `build` – bundle the SDK with Rollup and emit type definitions.
- `test` – run unit tests in Node via Jest.
- `prepare` – automatically invokes the build before publish.
- `release` – wraps `scripts/publish.js` to run checks and publish safely.

Publish with an optional version bump:

```bash
npm run release -- minor
```

## License

MIT © holly

