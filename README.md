<div align="center">
    <img src="https://raw.githubusercontent.com/WilliamRagstad/LavaStore-Deno/main/assets/logo.png" width="250px"/>
    <h1>LavaStore <code>Deno</code></h1>
    <p>A flexible and scalable local database for the web</p><br>
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/WilliamRagstad/LavaStore-Deno/Deno?style=flat-square&color=df5">
    <img alt="GitHub release" src="https://img.shields.io/github/release/WilliamRagstad/LavaStore-Deno?style=flat-square"/>
    <br/>
    <img alt="GitHub" src="https://img.shields.io/github/last-commit/WilliamRagstad/LavaStore-Deno?style=flat-square&color=f70">
    <img alt="GitHub" src="https://img.shields.io/github/contributors/WilliamRagstad/LavaStore-Deno?style=flat-square&color=f60">
	<img alt="Deno" src="https://img.shields.io/badge/deno-1.18.0+-yellow.svg?style=flat-square"/>
    <br/>
</div>








## About

LavaStore is a flexible and scalable local database for web development. It uses a document-oriented data model to store persistent data safely with our built-in powerful storage structure. This is the latest version for the Deno runtime ported from NPM.

View the project on [Deno.land](https://deno.land/x/lavastore) or [GitHub](https://github.com/WilliamRagstad/LavaStore-Deno).

## Featurs

- **Easy to learn**
- Intuitive **data modeling structure** inspired from [Firestore](https://firebase.google.com/docs/firestore/data-model) *(Firebase)*
- Simple and **readable** API

### Third-party extensions

- Query Language Support
  - [LavaStore QL](https://github.com/WilliamRagstad/LavaStore-QL) *(official)
- ~~Asynchronous~~ (in-progress)

## Usage

**Documents** contains **sub-collections** and **fields** *(data)*, and **Collections** contains **sub-documents**.

Always start with creating a `new LavaStore('my_store')` class and give it a unique ID. The next step is to either setup a store document and collection structure using either the `InsurePath()` method, or chained `Add()` methods. Alternatively, use `SetPath()` if you already have data to store in a specific subdocument.

The image below is an example of an Firestore structure which is easily replicable locally using LavaStore.

![Structure](assets/structure.png)

Here, **spotify** is a document containing no data but a **users** collection, where user-related data might be stored between sessions.

### Data model

The way we store data using LavaStore is heavily inspired by the **Cloud Firestore** data model.

> Unlike a SQL database, there are no tables or rows. Instead, you store data in *documents*, which are organized into *collections*.
>
> Each *document* contains a set of key-value pairs. Cloud Firestore is optimized for storing large collections of small documents.
>
> All documents must be stored in collections. Documents can contain *subcollections* and nested objects, both of which can include primitive fields like strings or complex objects like lists.

Read more about [structuring data](https://firebase.google.com/docs/firestore/manage-data/structure-data) and [data modeling](https://firebase.google.com/docs/firestore/data-model) from the Firebase documentation.




## Examples
The code below initializes a new LavaStore document root called `app`. When first running this code in the browser, we'll see a empty object being logged, but after a reload it contains the data `{ value: "Test" }`.

```typescript
// TypeScript
import { LavaStore } from "https://deno.land/x/lavastore/mod.ts";

const AppDocument = new LavaStore("app");

console.log(AppDocument.Get());

AppDocument.Set({
    value: "Test"
});
```

The true power of  

## Specification

| Description  | Value |
| ------------ | ----- |
| Package Size | 24 kB |
| Semi-colons  | ~80   |

### Public API

#### LavaStore

This is a regular [**LSDocument**](#LSDocument) with the only exception that it strictly must be root of a Document/Collection tree.

#### LSDocument

```typescript
class LSDocument {
    id: string;
    parent: LSCollection | undefined;
    Collection(id: string): LSCollection | undefined;
    Contains(id: string): boolean;
    Add(collection: LSCollection): void;
    Remove(id: string): void;
    InsurePath(path: string | string[]): void;
    Load(): void;
    Save(): void;
    Set(data: object): void;
    Get(): object;
    HasData(): boolean;
    SetPath(path: string | string[], data: object): void;
    GetPath(path: string | string[]): object;
    CollectionPath(path: string | string[]): LSCollection;
    DocumentPath(path: string | string[]): LSDocument;
    PassTo(callback: ((data: object) => any)): void;
}
```

#### LSCollection

```typescript
class LSCollection {
    id: string;
    parent: LSDocument | undefined;
    Contains(id: string): boolean;
    Document(id: string): LSDocument | undefined;
    Add(document: LSDocument): void;
    Remove(id: string): void;
}
```



## Want to help?

All help is very much appreciated! You can fork the repo right now and start building your own modified version right away, and if you happen to create something interesting and useful, don't hesitate to file a pull request!

### Sponsor this project

You can also help by supporting the project financially, all gifts are appreciated with great reverence and gratitude.

Developer: [paypal.me/williamragstad](http://paypal.me/williamragstad)
