import { LSDocument } from "./LSDocument.ts";
import { IDictionary } from "./types.ts";

export class LSCollection {
  public id: string;
  public parent: LSDocument | undefined;
  public documents: IDictionary<LSDocument> = {};

  constructor(id: string, documents: IDictionary<LSDocument> = {}) {
    this.id = id;
    this.documents = documents;
    Object.values(this.documents).forEach((document: LSDocument) =>
      document.parent = this
    );
  }

  /**
   * Check if the collection contains a document.
   * @param id ID of the document to check if it exists
   * @returns true if the document exists
   */
  public Contains(id: string): boolean {
    return this.documents[id] !== undefined;
  }

  /**
   * Get a document from the collection.
   * @param id ID of the document to get
   * @returns the document if it exists, undefined otherwise
   */
  public Document(id: string): LSDocument | undefined {
    return this.documents[id];
  }

  /**
   * Add a document to the collection.
   * @param document The document to add to the collection
   * @returns the document that was added
   */
  public Add(document: LSDocument): LSDocument {
    document.parent = this;
    this.documents[document.id] = document;
    if (this.parent) this.parent.Save();
    return this.documents[document.id];
  }

  /**
   * Remove a document from the collection.
   * @param id ID of the document to remove
   */
  public Remove(id: string) {
    delete this.documents[id];
  }
}
