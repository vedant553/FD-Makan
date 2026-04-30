## Server Architecture Scaffold

This folder contains production backend foundation for incremental migration from route-heavy handlers.

### Core utilities
- `core/api-response.ts`: typed success/error response envelope.
- `core/errors.ts`: centralized error classes and mapper.
- `core/validation.ts`: zod body/query parsers with consistent issue formatting.
- `core/logger.ts`: structured JSON logger.
- `core/request-context.ts`: request-id correlation helpers.
- `core/auth.ts`: auth/role wrappers and org-isolation utility.
- `core/pagination.ts`: shared pagination/filter primitives.
- `core/openapi.ts`: OpenAPI-ready route metadata helper.

### Module layout
Each domain module should follow this structure:

- `<module>/<module>.validators.ts`
- `<module>/<module>.repository.ts`
- `<module>/<module>.service.ts`
- `<module>/<module>.docs.ts`

### Current refactored example
- `modules/leads/*` is the first end-to-end refactored module.
