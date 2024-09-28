import { ApiEntity } from '@backstage/catalog-model';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
} from '@backstage/core-plugin-api';
import {
  ScmAuth,
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';
import {
  apiDocsConfigRef,
  defaultDefinitionWidgets,
  OpenApiDefinitionWidget,
} from '@backstage/plugin-api-docs';
import React from 'react';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: apiDocsConfigRef,
    deps: {},
    factory: () => {
      // Overriding openapi definition widget to add header
      const requestInterceptor = (req: any) => {
        if (typeof req?.headers !== 'object') return req;

        return {
          ...req,
          headers: { ...req.headers, 'x-api-key': (() => 'asdkjfhaskdjfh')() },
        };
      };
      const definitionWidgets = defaultDefinitionWidgets().map(obj => {
        if (obj.type === 'openapi') {
          return {
            ...obj,
            component: (definition: any) => (
              <OpenApiDefinitionWidget
                definition={definition}
                requestInterceptor={requestInterceptor}
              />
            ),
          };
        }
        return obj;
      });

      return {
        getApiDefinitionWidget: (apiEntity: ApiEntity) => {
          return definitionWidgets.find(d => d.type === apiEntity.spec.type);
        },
      };
    },
  }),
];
