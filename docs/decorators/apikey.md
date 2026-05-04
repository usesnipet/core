# ApiKey
## Description

ApiKey is a decorator that is used to protect the API endpoints. Can be used on controller or method, if used on controller, it will protect all the methods in the controller. If used on method, it will protect only the method.

## Properties
- root: boolean (default: false) - If true, the API key will be able to access all the API endpoints. (Root API key)