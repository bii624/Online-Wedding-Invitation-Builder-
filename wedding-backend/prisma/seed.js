"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding plans...');
    const freePlan = await prisma.plan.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {
            name: 'Free',
            price: 0,
            durationDays: null,
            maxCards: 3,
            features: {
                remove_watermark: false,
                premium_templates: false,
                custom_domain: false,
            },
            isActive: true,
        },
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Free',
            price: 0,
            durationDays: null,
            maxCards: 3,
            features: {
                remove_watermark: false,
                premium_templates: false,
                custom_domain: false,
            },
            isActive: true,
        },
    });
    const proPlan = await prisma.plan.upsert({
        where: { id: '00000000-0000-0000-0000-000000000002' },
        update: {
            name: 'Pro',
            price: 199000,
            durationDays: 30,
            maxCards: null,
            features: {
                remove_watermark: true,
                premium_templates: true,
                custom_domain: true,
            },
            isActive: true,
        },
        create: {
            id: '00000000-0000-0000-0000-000000000002',
            name: 'Pro',
            price: 199000,
            durationDays: 30,
            maxCards: null,
            features: {
                remove_watermark: true,
                premium_templates: true,
                custom_domain: true,
            },
            isActive: true,
        },
    });
    console.log('Seeding completed:');
    console.log('Free Plan:', freePlan);
    console.log('Pro Plan:', proPlan);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map