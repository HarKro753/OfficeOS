---
title: TypeScript in Strict Mode
impact: HIGH
impactDescription: catches entire categories of runtime bugs at compile time
tags: standards, typescript, strict, types
---

## TypeScript in Strict Mode

Enable TypeScript strict mode. Use type declarations as the first step when refactoring — update the types, then fix the errors. TypeScript is the cheapest bug prevention tool available.

**Incorrect (loose TypeScript config):**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}
```

```typescript
// Any is everywhere, no safety
function getUser(id) {
  return fetch(`/api/users/${id}`).then(r => r.json())
}
```

**Correct (strict mode with explicit types):**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

```typescript
interface User {
  id: string
  name: string
  email: string
}

async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) throw new Error(`Failed to fetch user ${id}`)
  return response.json() as Promise<User>
}
```

**Refactoring with types:**
1. Update the type definition first
2. Let TypeScript show all the places that break
3. Fix each error — TypeScript is your refactoring checklist
4. If you're fighting the type system, the design might be wrong
