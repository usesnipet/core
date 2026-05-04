# FilterOptions

## Description

FilterOptions is a decorator that is used to filter the API endpoints.

## Properties
- allowSort: boolean (default: true) - If true, the API endpoints will be able to sort the records.
- allowedFilters: (keyof TEntity)[] (default: []) - The filters that are allowed to be used in the API endpoints.
- allowedRelations: (keyof TEntity)[] (default: []) - The relations that are allowed to be used in the API endpoints.