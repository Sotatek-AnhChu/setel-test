import { applyDecorators, Query } from "@nestjs/common";
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiProperty,
  ApiQuery,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { QueryGetPipe } from "../pipe/query-get.pipe";

export const ApiPropertyFile = () =>
  ApiProperty({
    type: "string",
    format: "binary",
    required: false,
  });

export const ApiQueryCond = () =>
  ApiQuery({
    name: "cond",
    required: false,
    description: "condition MongoDB",
  });

export const ApiQuerySelect = () =>
  ApiQuery({
    name: "select",
    required: false,
    examples: {
      Default: { value: "" },
      Inclusive: { value: "_id createdAt updatedAt" },
      Exclusive: { value: "-createdAt -updatedAt" },
    },
  });

export const ApiQueryPagination = () =>
  applyDecorators(
    ApiQuery({
      name: "page",
      required: false,
      examples: {
        Empty: {},
        Default: { value: 1 },
      },
    }),
    ApiQuery({
      name: "limit",
      required: false,
      examples: {
        Empty: {},
        Default: { value: 20 },
      },
    }),
  );

export const ApiQuerySort = () =>
  applyDecorators(
    ApiQuery({
      name: "sort",
      required: false,
      examples: {
        Empty: {},
        "Example 1": { value: "_id createdAt updatedAt" },
        Default: { value: "updatedAt" },
      },
    }),
    ApiQuery({
      name: "order",
      required: false,
      examples: {
        Empty: {},
        "Example 1": { value: "-1 1 -1" },
        Default: { value: "-1" },
      },
    }),
  );

export const ApiQueryCustom = () =>
  ApiQuery({
    name: "custom",
    required: false,
    examples: {
      "Default value": { value: "" },
      "Manaual value": { value: 0 },
      "Auto value": { value: 1 },
    },
  });

export const ApiQueryGetMany = () =>
  applyDecorators(ApiQueryCustom(), ApiQueryCond(), ApiQuerySelect(), ApiQuerySort(), ApiQueryPagination());

export const ApiQueryGetManyNoCond = () =>
  applyDecorators(ApiQueryCustom(), ApiQueryCond(), ApiQuerySelect(), ApiQuerySort(), ApiQueryPagination());

export const QueryGet = () => Query(QueryGetPipe);

export const ApiCommonErrors = () =>
  applyDecorators(
    ApiUnauthorizedResponse({
      description: `Unauthorized`,
    }),
    ApiForbiddenResponse({
      description: `Forbiddent`,
    }),
    ApiInternalServerErrorResponse({
      description: `Server error `,
    }),
  );
