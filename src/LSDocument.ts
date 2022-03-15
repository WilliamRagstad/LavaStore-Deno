import { IDictionary } from "./types.ts";
import { LSCollection } from "./LSCollection.ts";

/**
 * LocalStorage Wrapper class
 */
abstract class LSWrapper {
  // deno-lint-ignore no-explicit-any
  public static Save = (label: string, data: any) =>
    localStorage.setItem("lavastore:" + label, JSON.stringify(data));

  public static Load = (label: string) =>
    JSON.parse(localStorage.getItem("lavastore:" + label) || "") as LSDocument;

  public static Contains = (label: string) =>
    !!localStorage.getItem("lavastore:" + label);
}

// tslint:disable-next-line: max-classes-per-file
export class LSDocument {
  private fields = {};
  public id = "";
  private _parent: LSCollection | undefined;
  public get parent(): LSCollection | undefined {
    return this._parent;
  }
  public set parent(value: LSCollection | undefined) {
    this._parent = value;
  }
  public collections: IDictionary<LSCollection> = {};

  constructor(
    id: string,
    fields = {},
    collections: IDictionary<LSCollection> = {},
  ) {
    this.id = id;
    this.fields = fields;
    this.collections = collections;
    Object.values(this.collections).forEach((collection: LSCollection) =>
      collection.parent = this
    );
  }

  /**
   * Get a collection from the document.
   * @param id ID of the collection to get
   * @returns The collection with the specified ID, or undefined if it does not exist
   */
  public Collection(id: string): LSCollection | undefined {
    return this.collections[id];
  }

  /**
   * Check if the document contains a document.
   * @param id ID of the collection to get
   * @returns True if collection exists, false otherwise
   */
  public Contains(id: string): boolean {
    return this.collections[id] !== undefined;
  }

  /**
   * Add a collection to the document.
   * @param collection The collection to add to the document
   * @returns The collection that was added
   */
  public Add(collection: LSCollection): LSCollection {
    collection.parent = this;
    this.collections[collection.id] = collection;
    this.Save();
    return this.collections[collection.id];
  }

  /**
   * Remove a collection from the document.
   * @param id ID of the document to remove
   */
  public Remove(id: string) {
    delete this.collections[id];
  }

  /**
   * Insure that the path exists. If not, create all collections and documents specified.
   * @param path the path to insure
   */
  public EnsurePath(path: string | string[]) {
    const pathArray = Array.isArray(path)
      ? path
      : ((path as string).includes("/") ? (path as string).split("/")
      : (path as string).split("\\"));
    if (pathArray.length === 0) {
      throw new Error(
        "Path must have entries. Please follow the format: ([COLLECTION]/[DOCUMENT])+",
      );
    }
    if (pathArray.length % 2 !== 0) {
      throw new Error(
        "Path must follow ([COLLECTION]/[DOCUMENT])+ format! Eg. 'users/Bob/tweets/7GA1J4V'.",
      );
    }

    // deno-lint-ignore no-this-alias
    let currentNode: LSDocument | LSCollection = this;
    for (const pathNode of pathArray) {
      if (currentNode.Contains(pathNode)) {
        // Walk to next node
        if (currentNode instanceof LSDocument) {
          currentNode = currentNode.Collection(pathNode) as LSCollection;
        } else if (currentNode instanceof LSCollection) {
          currentNode = currentNode.Document(pathNode) as LSDocument;
        }
      } else {
        // Add node to Document or Collection
        if (currentNode instanceof LSDocument) {
          currentNode = currentNode.Add(new LSCollection(pathNode));
        } else if (currentNode instanceof LSCollection) {
          currentNode = currentNode.Add(new LSDocument(pathNode));
        }
      }
    }
    this.Save();
  }

  public Load() {
    if (this.parent) {
      throw new Error("Cannot load child document, please load root.");
    }
    if (!LSWrapper.Contains(this.id)) return;
    const document = LSWrapper.Load(this.id);
    this.fields = document.fields;

    function loadCollections(
      collections: IDictionary<LSCollection>,
    ): IDictionary<LSCollection> {
      return Object.entries(collections).reduce(
        (
          collectionValues: Record<string, LSCollection>,
          [collectionKey, collectionValue]: [string, LSCollection],
        ) => {
          return {
            ...collectionValues,
            [collectionKey]: new LSCollection(
              collectionKey,
              Object.entries(collectionValue).reduce(
                (
                  documentValues: Record<string, LSDocument>,
                  [documentKey, documentValue]: [string, LSDocument],
                ) => {
                  return {
                    ...documentValues,
                    [documentKey]: new LSDocument(
                      documentKey,
                      documentValue.fields,
                      loadCollections(documentValue.collections),
                    ),
                  };
                },
                {},
              ),
            ),
          };
        },
        {},
      );
    }
    this.collections = loadCollections(document.collections);
    Object.values(this.collections).forEach((collection) =>
      collection.parent = this
    );
  }

  // deno-lint-ignore no-explicit-any
  private build(): Record<string, any> {
    return {
      fields: this.fields,
      collections: Object.values(this.collections).reduce(
        (cols, col: LSCollection) => {
          return {
            ...cols,
            [col.id]: Object.values(col.documents).reduce(
              (docs, doc: LSDocument) => {
                return {
                  ...docs,
                  [doc.id]: doc.build(),
                };
              },
              {},
            ),
          };
        },
        {},
      ),
    };
  }

  public Save() {
    if (this.parent) {
      if (this.parent.parent) this.parent.parent.Save();
      else {
        throw new Error(
          `Parent collection '${this.parent.id}' must not be root of store. Please append collection to a valid root document.`,
        );
      }
    } else LSWrapper.Save(this.id, this.build()); // This is root, store all containing data in one big object.
  }

  // deno-lint-ignore no-explicit-any
  public Set(data: Record<string, any>) {
    this.fields = { ...data };
    this.Save();
  }

  public Get() {
    return this.fields;
  }

  public HasData() {
    return this.fields !== undefined && this.fields !== {};
  }

  /**
   * Set data of a nested document. Path is insured before data is set.
   * @param path path to document. Must follow ([COLLECTION]/[DOCUMENT])+ format! Eg. 'users/Bob/tweets/7GA1J4V'. Path can also be array like ['users', 'Bob', 'tweets', '7GA1J4V'].
   * @param data data to set document fields to
   */
  // deno-lint-ignore no-explicit-any
  public SetPath(path: string | string[], data: Record<string, any>) {
    this.EnsurePath(path);
    this.DocumentPath(path).Set(data);
  }

  /**
   * Get data from a nested document
   * @param path path to document. Must follow ([COLLECTION]/[DOCUMENT])+ format! Eg. 'users/Bob/tweets/7GA1J4V'. Path can also be array like ['users', 'Bob', 'tweets', '7GA1J4V'].
   */
  // deno-lint-ignore no-explicit-any
  public GetPath(path: string | string[]): Record<string, any> {
    return this.DocumentPath(path).Get();
  }

  /* Path helper functions */
  private pathToArray = (path: string | string[]): string[] =>
    Array.isArray(path) ? path : (path as string).split("/");
  private pathTraverse(arr: string[], minLen: number) {
    if (arr.length <= minLen) {
      throw new Error(`Path must have more than ${minLen} entries.`);
    }
    // deno-lint-ignore no-this-alias
    let tmp: LSDocument | LSCollection | undefined = this;
    for (const node of arr) {
      if (tmp instanceof LSCollection) {
        if (!tmp.Contains(node)) {
          console.warn(`Path does not contain document '${node}'!`);
        }
        tmp = tmp.Document(node);
      } else if (tmp instanceof LSDocument) {
        if (!this.Contains(node)) {
          console.warn(`Path does not contain collection '${node}'!`);
        }
        tmp = tmp.Collection(node);
      }
    }
    return tmp;
  }

  /**
   * Return a nested collection
   * @param path path to collection. Must follow [COLLECTION]/([DOCUMENT]/[COLLECTION])* format! Eg. 'users/Bob/tweets'. Path can also be array like ['users', 'Bob', 'tweets'].
   */
  public CollectionPath(path: string | string[]): LSCollection {
    const arr = this.pathToArray(path);
    if (arr.length % 2 !== 1) {
      throw new Error(
        "Path must follow [COLLECTION]/([DOCUMENT]/[COLLECTION])* format! Eg. 'users/Bob/tweets'.",
      );
    }
    const result = this.pathTraverse(arr, 1);
    if (result !== undefined && !(result instanceof LSCollection)) {
      throw new Error(
        "Failed unexpectedly, return value was not of type LSCollection!",
      );
    }
    return result as LSCollection;
  }

  /**
   * Returns a document nested in collections
   * @param path path to document. Must follow ([COLLECTION]/[DOCUMENT])+ format! Eg. 'users/Bob/tweets/7GA1J4V'. Path can also be array like ['users', 'Bob', 'tweets', '7GA1J4V'].
   */
  public DocumentPath(path: string | string[]): LSDocument {
    const arr = this.pathToArray(path);
    if (arr.length % 2 !== 0) {
      throw new Error(
        "Path must follow ([COLLECTION]/[DOCUMENT])+ format! Eg. 'users/Bob/tweets/7GA1J4V'.",
      );
    }
    const result = this.pathTraverse(arr, 0);
    if (result !== undefined && !(result instanceof LSDocument)) {
      throw new Error(
        "Failed unexpectedly, return value was not of type LSDocument!",
      );
    }
    return result as LSDocument;
  }

  // deno-lint-ignore no-explicit-any
  public PassTo(callback: ((data: Record<string, any>) => any)) {
    callback(this.fields);
  }
}
