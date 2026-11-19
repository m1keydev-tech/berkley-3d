export const formatVndBillions = (value: number) => `${value.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
export const formatArea = (value: number) => `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} m²`;
