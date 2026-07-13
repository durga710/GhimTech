import { PRODUCTS } from "@/lib/content";
import { ProductCard } from "@/components/marketing/product-card";
import { MarketingSection, MarketingSectionHeader } from "@/components/marketing/marketing-section";

/**
 * Product roster — the two-product portfolio section of the homepage.
 * Replaces the previous single-RayHealth feature panel.
 */
export function FeaturedProject() {
  return (
    <MarketingSection id="products">
      <MarketingSectionHeader
        eyebrow="Products"
        title={<>Real products for serious operators.</>}
        body="RayHealthEVV runs healthcare operations today. Helix Studio is the developer platform direction for turning prompts into real software artifacts."
      />
      <div className="mt-12 grid gap-6">
        {PRODUCTS.map((product, index) => (
          <ProductCard key={product.slug} product={product} featured priority={index === 0} />
        ))}
      </div>
    </MarketingSection>
  );
}
