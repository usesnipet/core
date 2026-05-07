# Package
- id: uuid
- version: string
- name: string
- description: string
- docs: string
- icon: string
- tags: many2many(Tag)
- author: string
- createdAt: timestamptz
- updatedAt: timestamptz

# Node
- id: uuid
- nodeId: string
- packageId: uuid (references Package.id)
- name: string
- description: string
- docs: string
- icon: string
- tags: many2many(Tag)
- author: string
- type: uuid (references NodeType.id)
- config: uuid (references Config.id)
- createdAt: timestamptz
- updatedAt: timestamptz
  - unique(nodeId)

# NodeType
- id: uuid
- typeId: string
- packageId: uuid (references Package.id)
- name: string
- description: string
- docs: string
- icon: string
- tags: many2many(Tag)
- author: string
- inputs: jsonb
- outputs: jsonb
- components: jsonb
- createdAt: timestamptz
- updatedAt: timestamptz
  - unique(typeId)

# Config
- id: uuid
- configId: string
- packageId: uuid (references Package.id)
- name: string
- description: string
- docs: string
- icon: string
- tags: many2many(Tag)
- author: string
- fieldSchema: jsonb
- createdAt: timestamptz
- updatedAt: timestamptz
  - unique(configId)

# Tag
- id: uuid
- name: string
