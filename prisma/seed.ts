import { PrismaClient } from '@prisma/client'; // Используем PrismaClient
import { categories, brands, colors, sizes, types, products } from './constants';
import { hashSync } from 'bcrypt';

const prisma = new PrismaClient(); // Создаем экземпляр PrismaClient

async function down() {
    await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Brand" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Color" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Type" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Size" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "CartItem" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Cart" RESTART IDENTITY CASCADE;`;
}

async function up() {
    console.log('Seeding database...');

    // 1. Создаем пользователей
    await prisma.user.createMany({
        data: [
            {
                fullName: 'User Test',
                email: 'user@test.ru',
                password: hashSync('111111', 10),
                verified: new Date(),
                role: 'USER',
            },
            {
                fullName: 'Admin Admin',
                email: 'admin@test.ru',
                password: hashSync('111111', 10),
                verified: new Date(),
                role: 'ADMIN',
            },
        ],
        skipDuplicates: true, // Пропускать, если уже существует (по уникальным полям)
    });
    console.log('Created users');

    // 2. Создаем lookup-таблицы (Category, Brand, Color, Type, Size)
    await prisma.category.createMany({ data: categories, skipDuplicates: true });
    await prisma.brand.createMany({ data: brands, skipDuplicates: true });
    // Colors в константах просто массив строк, нужно преобразовать в { name: string }
    await prisma.color.createMany({
        data: colors.map(color => ({ name: color })),
        skipDuplicates: true
    });
    // Sizes в константах просто массив строк, нужно преобразовать в { name: string }
    await prisma.size.createMany({
        data: sizes.map(size => ({ name: size })),
        skipDuplicates: true
    });
    // Types в константах просто массив строк, нужно преобразовать в { name: string }
    await prisma.type.createMany({
        data: types.map(type => ({ name: type })),
        skipDuplicates: true
    });
    console.log('Created lookup tables (Category, Brand, Color, Size, Type)');


    // 3. Получаем созданные lookup-записи для связей продуктов
    const createdCategories = await prisma.category.findMany();
    const createdBrands = await prisma.brand.findMany();
    const createdColors = await prisma.color.findMany();
    const createdTypes = await prisma.type.findMany();
    const createdSizes = await prisma.size.findMany();

    // Создаем map для быстрого поиска ID размера по имени
    const sizeMap = new Map<string, number>();
    createdSizes.forEach(size => sizeMap.set(size.name, size.id));

    // 4. Создаем продукты
    // Используем `create` в цикле, т.к. нужен `connect` для sizes (Many-to-Many)
    // и нужно искать реальные ID по индексам/именам
    for (const productData of products) {
        // Находим реальные ID для связей Many-to-One, используя индексы из констант (константы 1-основанные индексы)
        const category = createdCategories[productData.categoryId - 1];
        const brand = createdBrands[productData.brandId - 1];
        const color = createdColors[productData.colorId - 1];
        const type = createdTypes[productData.typeId - 1];

        // Подготавливаем данные для связи Many-to-Many с размерами
        const sizesToConnect = productData.sizes.map(sizeName => {
            const sizeId = sizeMap.get(sizeName);
            if (sizeId === undefined) {
                console.warn(`Size "${sizeName}" not found for product "${productData.name}". Skipping connection.`);
                return null; // Пропускаем этот размер, если его нет в базе
            }
            return { id: sizeId };
        }).filter(item => item !== null) as { id: number }[]; // Удаляем null и приводим тип

        await prisma.product.create({
            data: {
                name: productData.name,
                imageUrl: productData.imageUrl,
                price: productData.price,
                description: productData.description,
                composition: productData.composition,
                // Связи Many-to-One
                categoryId: category.id,
                brandId: brand.id,
                colorId: color.id,
                typeId: type.id,
                // Связь Many-to-Many (Sizes)
                sizes: {
                    connect: sizesToConnect,
                },
            },
        });
    }
    console.log(`Created ${products.length} products`);


    // 5. Создаем корзины
    await prisma.cart.createMany({
        data: [
            // Пользователь с ID 1 получит корзину
            { userId: (await prisma.user.findFirst({ where: { email: 'user@test.ru' } }))?.id, totalAmount: 0, token: 'user-cart-token' },
            // Пользователь с ID 2 (админ) получит корзину
            { userId: (await prisma.user.findFirst({ where: { email: 'admin@test.ru' } }))?.id, totalAmount: 0, token: 'admin-cart-token' },
            // Можно создать корзину без пользователя для анонима
            { token: 'anonymous-cart-token', totalAmount: 0 },
        ].filter(item => item.userId !== undefined || item.token !== undefined), // Фильтруем, если пользователь не найден
        skipDuplicates: true, // Пропускаем, если token или userId уже уникальны
    });
    console.log('Created carts');

    // Получим ID корзины первого пользователя и первого продукта для примера CartItem
    const firstUserCart = await prisma.cart.findFirst({ where: { token: 'user-cart-token' } });
    const firstProduct = await prisma.product.findFirst();

    if (firstUserCart && firstProduct) {
        // Находим ID первого размера из созданных размеров
        const firstSize = createdSizes[0]; // Предполагаем, что createdSizes не пустой
    
        if (firstSize) {
            await prisma.cartItem.create({
                data: {
                    cartId: firstUserCart.id,
                    productId: firstProduct.id, // Используем реальный ID первого продукта
                    quantity: 2,
                    // ИСПРАВЛЕНО: Связываем CartItem с выбранным размером (Many-to-Many)
                    sizes: {
                        connect: [{ id: firstSize.id }],
                    },
                },
            });
            console.log('Created sample cart item with size');
        } else {
             console.warn('Could not create sample cart item: First size not found.');
        }
    
    } else {
        console.warn('Could not create sample cart item: User cart or first product not found.');
    }

    console.log('Seeding finished.');
}

async function main() {
    try {
        console.log('Starting seed...');
        // Очищаем базу перед началом (можно закомментировать для добавления данных)
        await down();
        // Заполняем базу
        await up();
        console.log('Seed executed successfully.');
    } catch (e) {
        console.error('Seed failed:');
        console.error(e);
        process.exit(1); // Выходим с ошибкой
    } finally {
        // Отключаемся от базы данных
        await prisma.$disconnect();
    }
}

// Выполняем главную функцию
main();