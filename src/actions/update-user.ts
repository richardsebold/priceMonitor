"use server";

import { prisma } from "@/lib/prisma";
import { SignupReformValues } from "@/schema-reform";

export async function updateUserData(formData: SignupReformValues) {
  try {
    const user = await prisma.user.update({
      where: { email: formData.email },
      data: {
        firstName: formData.firstname,
        lastName: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        zipCode: formData.zipcode,
        address: formData.address,
        city: formData.city,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, error: "Não foi possível atualizar os dados." };
  }
}