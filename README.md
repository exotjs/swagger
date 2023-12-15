# OpenAPI / Swagger plugin for Exot

This plugin auto-generates OpenAPI specification for the parent Exot instance.

It adds two new endpoints:

`GET /swagger.json` - returns OpenAPI specs in JSON.

`GET /swagger` - serves OpenAPI UI.

## Usage

```js
import { Exot, t } from '@exotjs/exot';
import swagger from '@exotjs/swagger';

new Exot()
  // mount plugin
  .use(swagger())

  // add routes
  .post('/', async ({ json }) => {
    return {
      received: await json(),
    };
  }, {
    body: t.Object({
      name: t.String(),
    }, {
      description: 'Payload with user\'s name',
    }),
    swagger: {
      description: '...',
      summary: 'Say hi'
    },
  })

  // bind port
  .listen(3000);
```

## License

MIT