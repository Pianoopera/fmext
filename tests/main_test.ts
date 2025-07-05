import { assertEquals } from "jsr:@std/assert";
import { parseFrontMatter } from "../src/main.ts";

Deno.test("parseFrontMatter - parses valid front matter", () => {
  const input = `---
title: Test Post
author: John Doe
date: 2023-01-01
---

This is the content of the post.`;

  const result = parseFrontMatter(input);

  assertEquals(result.frontMatter.title, "Test Post");
  assertEquals(result.frontMatter.author, "John Doe");
  assertEquals(result.frontMatter.date, "2023-01-01");
  assertEquals(result.content, "This is the content of the post.");
});

Deno.test("parseFrontMatter - handles content without front matter", () => {
  const input = "This is just regular content without front matter.";

  const result = parseFrontMatter(input);

  assertEquals(Object.keys(result.frontMatter).length, 0);
  assertEquals(result.content, input);
});

Deno.test("parseFrontMatter - handles empty front matter", () => {
  const input = `---
---
Content after empty front matter.`;

  const result = parseFrontMatter(input);

  assertEquals(Object.keys(result.frontMatter).length, 0);
  assertEquals(result.content, "---\n---\nContent after empty front matter.");
});

Deno.test("parseFrontMatter - handles multiline values", () => {
  const input = `---
title: Test Post
description: This is a longer description that might span multiple lines
tags: tag1, tag2, tag3
---

Main content here.`;

  const result = parseFrontMatter(input);

  assertEquals(result.frontMatter.title, "Test Post");
  assertEquals(
    result.frontMatter.description,
    "This is a longer description that might span multiple lines",
  );
  assertEquals(result.frontMatter.tags, "tag1, tag2, tag3");
  assertEquals(result.content, "Main content here.");
});
