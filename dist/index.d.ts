import { Exot } from '@exotjs/exot';
import type { AnyStackHandlerOptions } from '@exotjs/exot/types';
type ContentType = 'text/plain' | 'application/json';
export declare enum StatusCode {
    OK = "200",
    NO_CONTENT = "204"
}
export interface Route {
    method?: string;
    options?: AnyStackHandlerOptions & HandlerSwaggerOptions;
    path: string;
    instance: Exot;
}
export interface RouteParam {
    name: string;
    required: boolean;
}
export interface SwaggerInit {
    info: {
        description?: string;
        title: string;
        version: string;
    };
    ui?: SwaggerUIOptions;
}
export interface SwaggerUIOptions {
    autoDarkMode?: boolean;
    bundle?: string;
    disabled?: boolean;
    swaggerOptions?: any;
    theme?: string | {
        dark: string;
        light: string;
    };
    version?: string;
}
export type HandlerSwaggerOptions = {
    swagger?: {
        description?: string;
        hidden?: boolean;
        summary?: string;
        requestBody?: {
            contentType?: string;
            description?: string;
            required?: boolean;
        };
        responses?: Partial<Record<StatusCode, {
            content?: Partial<Record<ContentType, {
                schema: any;
            }>>;
            contentType?: string;
            description?: string;
        }>>;
        tags?: string[];
    };
};
export declare const swagger: (init: SwaggerInit) => Exot<{}, {}, {}, HandlerSwaggerOptions, import("@exotjs/exot/types").ContextInterface<any, any, any, any, {}, {}>>;
export {};
