// app/(root)/page.tsx
import { Suspense } from 'react'; // 1. Импортируем Suspense
import { Container, Filters, Title } from "@/shared/components/shared";
import { ProductsGroupList } from "@/shared/components/shared/products-group-list";
import { TopBarClient } from "@/app/(root)/TopBarClient";
import { findProduct, GetSearchParams } from "@/shared/lib/find-products";

// 2. (Опционально) Создайте простые компоненты-заглушки (fallback)
const TopBarFallback = () => (
  <div className="my-4 h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700">
    {/* Можете добавить сюда простой макет вашего TopBar */}
  </div>
);
const FiltersFallback = () => (
  <div className="w-[250px]">
    <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-4"></div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      ))}
    </div>
  </div>
);


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<GetSearchParams>;
}) {
  const params = await searchParams;
  const categories = await findProduct(params);

  return (
    <>
      <Container className="mt-10">
        <Title text="Каталог" size="lg" className="font-extrabold" />
      </Container>

      {/* 3. Оборачиваем TopBarClient в Suspense */}
      <Suspense fallback={<TopBarFallback />}>
        <TopBarClient
          categories={categories.filter(c => c.products.length > 0)}
          sortBy={params.sortBy || 'popular'}
        />
      </Suspense>

      <Container className="mt-10 pb-14">
        <div className="flex gap-[80px]">
          <div className="w-[250px]">
            {/* 4. Оборачиваем Filters в Suspense */}
            <Suspense fallback={<FiltersFallback />}>
              <Filters />
            </Suspense>
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-16">
              {categories.map(category =>
                category.products.length > 0 && (
                  <ProductsGroupList
                    key={category.id}
                    title={category.name}
                    categoryId={category.id}
                    items={category.products}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}