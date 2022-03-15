import { assertEquals } from "https://deno.land/std@0.129.0/testing/asserts.ts";
import { LavaStore } from "../mod.ts";

/**
 * Test that an instance of the LavaStore class can be created with a unique ID.
 */
Deno.test("Test create LavaStore document with ID", () => {
  const doc = new LavaStore("test-app");
  assertEquals(doc.id, "test-app");
});

/**
 * Test that a LavaStore document can be created with initial data.
 */
Deno.test("Test create LavaStore document with initial data", () => {
  const doc = new LavaStore("test-app", {
    test1: "test data",
    test2: 42,
    test3: true,
  });
  assertEquals(doc.Get("test1"), "test data");
  assertEquals(doc.Get("test2"), 42);
  assertEquals(doc.Get("test3"), true);
});