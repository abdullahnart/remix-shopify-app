// app/routes/products._index.jsx
import { json } from "@remix-run/node";

import { useLoaderData, Link } from "@remix-run/react";
import prisma from "../db.server";
import { Page, Card, Layout, TextContainer, Button, ResourceList, ResourceItem, Text } from "@shopify/polaris";

export async function loader() {
  const products = await prisma.product.findMany({ orderBy: { id: "desc" } });
  return json({ products });
}

export default function ProductsIndex() {
  const { products } = useLoaderData();

  return (
    <Page
      title="Products"
      primaryAction={{
        content: "+ New Product",
        url: "/products/new",
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              resourceName={{ singular: "product", plural: "products" }}
              items={products}
              renderItem={(item) => {
                const { id, title, price } = item;
                return (
                  <ResourceItem id={id} url={`/products/${id}`}>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                      {title}
                    </Text>
                    <div>
                      <Text as="span" color="subdued">
                        ${price}
                      </Text>
                    </div>
                  </ResourceItem>
                );
              }}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
