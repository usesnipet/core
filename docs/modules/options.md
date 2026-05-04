# FilterOptions<\\TEntity>
## Description

Filter Options is a class that is used to filter the entities in the database.

## Properties

- take: number
- skip: number
- where: FindOptionsWhere<\\TEntity>
- order: FindOptionsOrder<\\TEntity>
- relations: FilterOptionsRelations<\\TEntity>

---

# FilterOptionsWhere<\\TEntity>

## Description

FilterOptionsWhere is a class that is used to filter the entities in the database.

## Properties

- keyof Entity: any

---

# FilterOptionsOrder<\\TEntity>

## Description

FilterOptionsOrder is a class that is used to order the entities in the database.

## Properties

- keyof Entity: "ASC" | "DESC"

---

# FilterOptionsRelations<\\TEntity>

## Description

FilterOptionsRelations is a class that is used to filter the relations in the database.

## Properties

- relations: (keyof TEntity)[]

---

# Options
## Description
Options is a type that is used to pass the options to the service methods.

## Properties
- tx?: Transaction