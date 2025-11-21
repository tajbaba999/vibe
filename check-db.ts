import { prisma } from "./lib/db";

async function main() {
    console.log("Connecting to DB...");
    const projects = await prisma.project.findMany({
        include: {
            _count: {
                select: { files: true },
            },
        },
    });
    console.log("Projects found:", projects.length);
    console.log(JSON.stringify(projects, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
