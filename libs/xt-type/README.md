![ng-xtend logo](https://dont-code.net/assets/images/logos/logo-xtend-angular-red-small.png)

# XT-Type

**A TypeScript framework for handling data of unknown types.**

XT-Type provides a robust, extensible type system for TypeScript applications, enabling you to define, manage, and transform complex data structures dynamically. It is designed to support runtime type definitions, hierarchical type management, and seamless integration with modern TypeScript projects.

---

## 🌟 Key Features

### **1. Type System**
- Define types as:
    - **Primitives**: `string`, `number`, `boolean`, `date`, etc.
    - **Objects**: Named sets of primitives or sub-objects.
    - **Relationships**: One-to-many, many-to-one, and many-to-many references between types.
    - **Managed Types**: Objects with fields defined as IDs (see [src/handler/xt-type-handler.ts](src/handler/xt-type-handler.ts)).
- Automatic conversion of date types to/from JSON (see [src/managed-data/managed-data-handler.ts](src/managed-data/managed-data-handler.ts)).

### **2. Type Repository**
- Manage types in a hierarchical structure (see [src/resolver/xt-type-resolver.ts](src/resolver/xt-type-resolver.ts)).

### **3. Type Handlers**
- Standardized handling for any type (see [src/handler/xt-type-handler.ts](src/handler/xt-type-handler.ts)).
- Default handlers for primitives, data objects, and arrays (see [src/handler/default/default-type-handler.ts](src/handler/default/default-type-handler.ts)).
- Support for displayable strings, calculations, and legacy values.

### **4. Type Transformers**
- Transform one type to another (see [src/transformation/special-fields.ts](src/transformation/special-fields.ts)).
- Manipulate any type as if it were another (see [src/transformation/mapping-helper.ts](src/transformation/mapping-helper.ts)).

---

## 🔧 Integration

XT-Type is used by the **[ng-xtend framework](https://github.com/dont-code/ng-xtend/blob/main/README.md)** to support types defined by plugins loaded at runtime.

---

## 🛠 Built With

- **[ts-base](https://github.com/bgub/ts-base)**: A TypeScript library starter template featuring Biome, Vitest, tsdown, and automated releases.

---

## 📦 Installation

```bash
npm install xt-type
