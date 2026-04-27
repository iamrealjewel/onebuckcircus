const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const email = "iamrealjewel@gmail.com";
  const newPassword = "admin123";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  console.log(`Resetting password for ${email}...`);

  const user = await prisma.user.update({
    where: { email: email },
    data: { 
      password: hashedPassword,
      role: "ADMIN" // Ensure role is still ADMIN
    },
  });

  console.log("Password reset successful for:", user.email);
}

main()
  .catch((e) => {
    console.error("Error resetting password:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
