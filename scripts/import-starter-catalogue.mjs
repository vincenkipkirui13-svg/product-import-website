import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
const catalogue = JSON.parse(readFileSync(new URL("../data/starter-catalogue.json", import.meta.url), "utf8"));

const prisma = new PrismaClient();

try {
  for (const item of catalogue.products) {
    const image = {
      url: item.imageUrl,
      alt: item.name,
      sortOrder: 0
    };
    await prisma.product.upsert({
      where: { sourceId_sourceSku: { sourceId: item.sourceId, sourceSku: item.sourceSku } },
      create: {
        sourceId: item.sourceId,
        sourceSku: item.sourceSku,
        sourceUrl: item.sourceUrl,
        name: item.name,
        slug: item.slug,
        description: item.description,
        sourcePrice: null,
        sellingPrice: item.sellingPrice.toFixed(2),
        referencePrice: item.referencePrice.toFixed(2),
        referencePriceUrl: item.referencePriceUrl,
        referencePriceCheckedAt: new Date(catalogue.researchedAt + "T12:00:00.000Z"),
        currency: "KES",
        availability: "AVAILABLE",
        category: item.category,
        images: { create: [image] }
      },
      update: {
        sourceUrl: item.sourceUrl,
        name: item.name,
        description: item.description,
        referencePrice: item.referencePrice.toFixed(2),
        referencePriceUrl: item.referencePriceUrl,
        referencePriceCheckedAt: new Date(catalogue.researchedAt + "T12:00:00.000Z"),
        category: item.category,
        images: { deleteMany: {}, create: [image] }
      }
    });
  }
  console.log(`Starter catalogue processed: ${catalogue.products.length} records.`);
} finally {
  await prisma.$disconnect();
}
