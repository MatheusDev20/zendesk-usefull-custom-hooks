# Zendesk Custom Objects React Hooks

A TypeScript library providing React hooks for seamless integration with Zendesk Custom Objects Records API. Built on top of React Query for optimal caching, error handling, and data synchronization.

## Installation

```bash
npm install zendesk-custom-objects-working-hooks
# or
yarn add zendesk-custom-objects-working-hooks
```

## Quick Start

### 1. Setup Provider

Wrap your app with the `CustomObjectsProvider`:

```tsx
import { CustomObjectsProvider } from 'zendesk-custom-objects-working-hooks';

function App() {
  return (
    <CustomObjectsProvider client={zafClient}>
      <MyApp />
    </CustomObjectsProvider>
  );
}
```

### 2. Query Custom Object Records

```tsx
import { useQueryCustomObjects } from 'zendesk-custom-objects-working-hooks';

function UsersList() {
  const { data, isLoading, error } = useQueryCustomObjects({
    customObjectKey: "users",
    translateFn: (raw) => raw.map(user => ({
      id: user.id,
      name: user.custom_object_fields.name,
      email: user.custom_object_fields.email
    })),
    refetchOnTabChange: true,
    searchBySingleField: { by: "status", value: "active" }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}
```

### 3. Create New Records

```tsx
import { usePostCustomObjects } from 'zendesk-custom-objects-working-hooks';

type MyNativeCustomObjectFields = {
  cpf: string;
  gender: string;
}

function CreateUser() {
  const { execute, isLoading } = usePostCustomObjects<MyNativeCustomObjectFields>({
    customObjectKey: "users",
    postActionFn: () => console.log('SOme action you want to do after the creation'),
  });

  const handleSubmit = async (formData) => {
    try {
      const input = {
        // Gets type checked by the generic <T> passed as hook instatiation (= 
        custom_object_fields: { cpf: "11111111", geneder: "M" },
        name: 'Matheus'
      }

      await execute(input);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}

```

###  Updating Records 

```tsx
import { usePostCustomObjects } from 'zendesk-custom-objects-working-hooks';

type FieldsThatIWantToUpdate = {
  gender: string;
}

function UpdateUser() {
  const { execute, isLoading } = useUpdateCustomObjects<FieldsThatIWantToUpdate>({
    customObjectKey: "users",
    postActionFn: () => console.log('SOme action you want to do after the update'),
  });

  const handleSubmit = async (formData) => {
    try {
      const input = {
        // No need to pass all properties, since the Partial<T> acts behind the scenes
        custom_object_fields: { gender: "M" },
        // Name is optional, set it if you want to update.
        name: 'Matheus'
      }

      await execute(input);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <form onSubmit {handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update'}
      </button>
    </form>
  );
}

```
### Complex Filtering



```tsx
const { data } = useQueryCustomObjects({
  customObjectKey: "orders",
  translateFn: (raw) => raw.map(order => ({
    id: order.id,
    total: order.custom_object_fields.total,
    status: order.custom_object_fields.status
  })),
  filterCriteria: {
    filter: {
      $and: [
        { "custom_object_fields.status": { $eq: "pending" } },
        { "custom_object_fields.total": { $gte: 100 } }
      ]
    }
  },
  refetchOnTabChange: false
});
```

### TypeScript Integration

```tsx
type User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const { data } = useQueryCustomObjects<User>({
  customObjectKey: "users",
  translateFn: (raw): User[] => raw.map(item => ({
    id: item.id,
    name: item.custom_object_fields.name,
    email: item.custom_object_fields.email,
    createdAt: new Date(item.created_at)
  })),
  refetchOnTabChange: true
});

// data is now typed as User[] | undefined
