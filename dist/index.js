import { Exot } from '@exotjs/exot';
export var StatusCode;
(function (StatusCode) {
    StatusCode["OK"] = "200";
    StatusCode["NO_CONTENT"] = "204";
})(StatusCode || (StatusCode = {}));
export const swagger = (init) => {
    let routes = [];
    const exot = new Exot({
        handlerOptions: {},
        onComposed(parent) {
            if (parent) {
                routes = parent.routes;
            }
        },
    })
        .get('/swagger.json', () => {
        return {
            openapi: '3.0.3',
            info: {
                ...init.info,
            },
            paths: routes.reduce((acc, route) => {
                if (route.options?.swagger?.hidden !== true) {
                    const paths = getPaths(route.path);
                    for (let { params, path } of paths) {
                        const docs = processRoute(route, params);
                        if (docs) {
                            if (!acc[path]) {
                                acc[path] = {};
                            }
                            if (route.method) {
                                acc[path][route.method.toLowerCase()] = docs;
                            }
                        }
                    }
                }
                return acc;
            }, {}),
        };
    }, {
        swagger: {
            hidden: true,
        },
    });
    if (init.ui?.disabled !== true) {
        exot.get('/swagger', ({ set }) => {
            set.headers.set('content-type', 'text/html; charset=utf8');
            return createUI(init);
        }, {
            swagger: {
                hidden: true,
            },
        });
    }
    return exot;
};
function processRoute(route, params) {
    const parameters = [];
    if (params.length) {
        const paramsSchema = route.options?.params;
        for (let { name, required } of params) {
            parameters.push({
                description: paramsSchema?.properties[name]?.description,
                in: 'path',
                name,
                required: true,
                schema: {
                    type: 'string',
                },
            });
        }
    }
    if (route.options?.query && route.options.query?.properties) {
        for (let name in route.options.query.properties) {
            const schema = route.options.query.properties[name];
            parameters.push({
                description: schema?.description,
                in: 'query',
                name,
                required: route.options.query.required?.includes(name),
                schema: normalizeSchema(schema),
            });
        }
    }
    if (route.method) {
        const swagger = route.options?.swagger || {};
        return {
            description: swagger.description,
            parameters,
            requestBody: route.options?.body ? {
                content: {
                    [swagger.requestBody?.contentType || 'application/json']: {
                        schema: normalizeSchema(route.options.body),
                    },
                },
                description: swagger.requestBody?.description || route.options.body.description,
                required: swagger.requestBody?.required ?? true,
            } : void 0,
            responses: {
                '200': {
                    content: {
                        [swagger.responses?.['200']?.contentType || 'application/json']: {
                            schema: route.options?.response ? normalizeSchema(route.options.response) : {
                                type: 'object',
                            },
                        },
                    },
                    description: swagger.responses?.['200']?.description || route.options?.response?.description || '',
                },
                ...swagger.responses,
            },
            summary: swagger.summary,
            tags: swagger.tags,
        };
    }
    return {};
}
function normalizeSchema(schema) {
    return {
        ...schema,
        description: void 0,
    };
}
function getPaths(path) {
    const parts = path.split('/');
    return parts.reduce((acc, part) => {
        const match = part.match(/\:([\w_]+)(\([^\/\)]+\))?(\?)?/);
        if (match) {
            const name = match[1];
            const optional = !!match[3];
            if (optional) {
                acc.push({ params: [{
                            name,
                            required: !optional,
                        }], path: [...acc[acc.length - 1].path] });
            }
            else {
                acc[acc.length - 1].params.push({
                    name,
                    required: !optional,
                });
            }
            acc[acc.length - 1].path.push(`{${name}}`);
        }
        else {
            acc[acc.length - 1].path.push(part);
        }
        return acc;
    }, [{
            params: [],
            path: [],
        }]).map(({ params, path }) => ({ params, path: path.join('/') }));
}
function createUI(init) {
    let { autoDarkMode = true, bundle, swaggerOptions, theme, version = '5.10.5', } = init.ui || {};
    bundle =
        bundle ||
            `https://unpkg.com/swagger-ui-dist@${version}/swagger-ui-bundle.js`;
    theme =
        theme || `https://unpkg.com/swagger-ui-dist@${version}/swagger-ui.css`;
    const options = JSON.stringify({
        url: `swagger.json`,
        dom_id: '#swagger-ui',
        ...swaggerOptions,
    });
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${init.info.title} ${init.info.version}</title>
      <meta
          name="description"
          content="${init.info.description || ''}"
      />
      <meta
          name="og:description"
          content="${init.info.description || ''}"
      />
      ${autoDarkMode && typeof theme === 'string'
        ? `
      <style>
          @media (prefers-color-scheme: dark) {
              body {
                  background-color: #181818;
                  color: #04ccef;
              }
              .swagger-ui {
                  filter: invert(92%) hue-rotate(180deg);
              }
  
              .swagger-ui .microlight {
                  filter: invert(100%) hue-rotate(180deg);
              }
          }
      </style>`
        : ''}
      ${typeof theme === 'string'
        ? `<link rel="stylesheet" href="${theme}" />`
        : `<link rel="stylesheet" media="(prefers-color-scheme: light)" href="${theme.light}" />
  <link rel="stylesheet" media="(prefers-color-scheme: dark)" href="${theme.dark}" />`}
  </head>
  <body>
      <div id="swagger-ui"></div>
      <script src="${bundle}" crossorigin></script>
      <script>
          window.onload = () => {
              window.ui = SwaggerUIBundle(${options});
          };
      </script>
  </body>
  </html>`;
}
