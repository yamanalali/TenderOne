import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getProductDestination } from "@/lib/product-destination";

describe("getProductDestination", () => {
  it("routes analysis credits to the new analysis page", () => {
    const destination = getProductDestination({
      id: "a1",
      type: "analysis_credit",
      metadata: null,
    });
    assert.equal(destination.href, "/analyses/new");
    assert.match(destination.label, /تحليل/);
  });

  it("routes templates to their download page", () => {
    const destination = getProductDestination({
      id: "t1",
      type: "template",
      metadata: { templateCode: "rfq" },
    });
    assert.equal(destination.href, "/templates/t1/download");
    assert.match(destination.label, /تنزيل/);
  });

  it("routes documents pack to the templates gallery", () => {
    const destination = getProductDestination({
      id: "s1",
      type: "service",
      metadata: { serviceCode: "documents_pack" },
    });
    assert.equal(destination.href, "/templates");
  });

  it("routes manual services to my-services", () => {
    const destination = getProductDestination({
      id: "m1",
      type: "service",
      metadata: { fulfillment: "manual", catalogCode: "final_review" },
    });
    assert.equal(destination.href, "/my-services");
    assert.match(destination.description, /يدوياً/);
  });
});
