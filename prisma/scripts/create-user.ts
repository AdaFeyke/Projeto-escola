import prisma from "../../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const senhaHash = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      nome: "Usuário Teste",
      email: "teste@teste.com",
      senhaHash: senhaHash,
    },
  });

  console.log("Usuário criado:", user);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
