declare module 'swagger-jsdoc' {
  export interface Options {
    definition: {
      openapi?: string;
      swagger?: string;
      info: {
        title: string;
        version: string;
        description?: string;
        contact?: {
          name?: string;
          email?: string;
          url?: string;
        };
      };
      servers?: Array<{
        url: string;
        description?: string;
      }>;
      components?: {
        securitySchemes?: Record<string, any>;
      };
      tags?: Array<{
        name: string;
        description?: string;
      }>;
    };
    apis: string[];
  }

  function swaggerJsdoc(options: Options): any;
  export default swaggerJsdoc;
}

