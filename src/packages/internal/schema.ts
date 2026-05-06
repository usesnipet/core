import { Package } from "@/core/schemas/package";

export const schema: Package = {
  "nodeTypes": [
    {
      "id": "internal:node-type:log",
      "metadata": {
        "name": "Log",
        "description": "Log a message to the console"
      },
      "inputs": {
        "message": {
          "type": "string",
          "description": "The message to log",
          "required": true
        }
      },
      "outputs": {
        "message": {
          "type": "string",
          "description": "The message logged"
        }
      }
    },
    {
      "id": "internal:node-type:sleep",
      "metadata": {
        "name": "Sleep",
        "description": "Sleep for a given number of milliseconds"
      },
      "inputs": {
        "milliseconds": {
          "type": "number",
          "description": "The number of milliseconds to sleep",
          "required": true
        }
      },
      "outputs": {
        "void": {
          "type": "void",
          "description": "A void output"
        }
      }
    },
    {
      "id": "internal:node-type:storage",
      "metadata": {
        "name": "Storage",
        "description": "Store data in a storage"
      },
      "inputs": {
        "files": {
          "type": "files",
          "description": "The files to store",
          "required": true
        },
        "path": {
          "type": "string",
          "description": "The path to store the files",
          "required": true
        }
      },
      "outputs": {
        "void": {
          "type": "void",
          "description": "A void output"
        }
      },
    }
  ],
  "configs": [
    {
      "id": "internal:config:storage",
      "metadata": {
        "name": "Storage",
        "description": "Storage configuration"
      },
      "fields": {
        "basePath": {
          "type": "string",
          "description": "The base path to store the files",
          "required": true
        }
      }
    }
  ],
  "nodes": [
    {
      "id": "internal:node:log",
      "type": "internal:node-type:log",
    },
    {
      "id": "internal:node:sleep",
      "type": "internal:node-type:sleep",
    },
    {
      "id": "internal:node:file-system",
      "type": "internal:node-type:storage",
      "config": "internal:config:storage",
      "metadata": {
        "name": "FileSystem Storage",
        "description": "Store data in the file system"
      }
    }
  ]
}