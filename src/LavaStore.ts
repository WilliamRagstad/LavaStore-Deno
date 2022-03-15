import { LSDocument } from "./LSDocument.ts";
import { IDictionary } from "./types.ts";
import { LSCollection } from "./LSCollection.ts";

export class LavaStore extends LSDocument {
  public set parent(_p: never) {
    throw new Error(
      `Cannot add LavaStore Document '${this.id}' as child to a Collection!`,
    );
  }
  constructor(
    id: string,
    // deno-lint-ignore no-explicit-any
    fields: Record<string, any> = {},
    collections: IDictionary<LSCollection> = {},
  ) {
    super(id, fields, collections);
    this.Load(); // Load cached data from local storage
  }
}
