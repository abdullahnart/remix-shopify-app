import { json, redirect } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import prisma from "../db.server";
import { Page, Card, Layout, TextField, Button, InlineError } from "@shopify/polaris";
import { useState } from "react";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    console.log("Shopify admin:", admin);
    console.log("Shopify session:", session);
    const formData = await request.formData();
    const title = formData.get("name");
    const price = parseFloat(formData.get("price"));
    if (!title || isNaN(price)) {
      return json({ error: "Name and price are required." }, { status: 400 });
    }
    // Create product in Shopify store
    const product = await admin.rest.resources.Product.create({
      title,
      variants: [{ price }],
    });
    // Save Shopify product ID and details in local DB
    await prisma.product.create({
      data: {
        title,
        price,
        shopifyId: product.id?.toString() || null,
      },
    });
    return redirect("/products");
  } catch (error) {
    console.error("Shopify authentication error:", error);
    throw error;
  }
}

export default function NewProduct() {
  const actionData = useActionData();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  return (
    <Page title="Add New Product">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Form method="post">
              <TextField
                label="Product Name"
                value={name}
                onChange={setName}
                name="name"
                autoComplete="off"
              />
              <TextField
                label="Price"
                value={price}
                onChange={setPrice}
                name="price"
                type="number"
                autoComplete="off"
                prefix="$"
              />
              {actionData?.error && (
                <InlineError message={actionData.error} fieldID="name" />
              )}
              <Button primary submit>
                Create Product
              </Button>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
