export function formatCurrency(value: number | string | any): string {
    const amount = typeof value === "string" ? parseFloat(value) : Number(value);

    if (isNaN(amount)) {
        return "R$ 0,00";
    }

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}