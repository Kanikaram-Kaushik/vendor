export interface MatrixCellData {
  code: number
  hardware: string
  coreMaterial: string
  externalFinish: string
  price: number
}

export const ITEM_TYPES = [
  { name: 'Tv Cabinet', code: 1, group: 'Living & Dining / MBR / CBR / GBR' },
  { name: 'Crockery Unit', code: 2, group: 'Living & Dining' },
  { name: 'Puja Unit', code: 2, group: 'Living & Dining' },
  { name: 'Partition', code: 1, group: 'Living & Dining' },
  { name: 'Wardrobe', code: 2, group: 'MBR / CBR / GBR' },
  { name: 'Tv Unit', code: 1, group: 'MBR / CBR / GBR' },
  { name: 'Study Unit', code: 1, group: 'MBR / CBR / GBR' },
  { name: 'Bed', code: 2, group: 'MBR / CBR / GBR' },
  { name: 'Bedside Table', code: 1, group: 'MBR / CBR / GBR' },
  { name: 'Dressing Unit', code: 2, group: 'MBR / CBR / GBR' },
  { name: 'Base Unit (Kitchen)', code: 2, group: 'Kitchen' },
  { name: 'Wall Unit (Kitchen)', code: 2, group: 'Kitchen' },
  { name: 'Loft', code: 1, group: 'Kitchen' },
  { name: 'Tall units (Kitchen)', code: 2, group: 'Kitchen' },
  { name: 'Shoerack', code: 1, group: 'Outside' },
]

export const DEFAULT_MATRIX: MatrixCellData[] = [
  // Code 1 - EBCO
  { code: 1, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 900 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1000 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1200 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1000 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1200 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1400 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1000 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1200 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1400 },

  // Code 1 - HETTICH
  { code: 1, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1050 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1150 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1350 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1150 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1350 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1550 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1150 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1350 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1550 },

  // Code 1 - HAFELE
  { code: 1, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1200 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1300 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1500 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1300 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1500 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1700 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1300 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1500 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1700 },

  // Code 2 - EBCO
  { code: 2, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1200 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1400 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1600 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1400 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1600 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1800 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1400 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1600 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1800 },

  // Code 2 - HETTICH
  { code: 2, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1350 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1550 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1750 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1550 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1750 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1950 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1550 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1750 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1950 },

  // Code 2 - HAFELE
  { code: 2, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1500 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1700 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1900 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1700 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1900 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 2100 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1700 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1900 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 2100 },
]

export function findMatrixPrice(
  cells: MatrixCellData[],
  code: number,
  hardware: string,
  coreMaterial: string,
  externalFinish: string
): number | null {
  const normHw = (hardware || '').trim().toUpperCase()
  const normCore = (coreMaterial || '').trim().toUpperCase()
  const normFinish = (externalFinish || '').trim().toUpperCase()

  // 1. Try matching brand's custom saved cells
  if (cells && cells.length > 0) {
    const matched = cells.find(
      (c) =>
        c.code === code &&
        (c.hardware || '').trim().toUpperCase() === normHw &&
        (c.coreMaterial || '').trim().toUpperCase() === normCore &&
        (c.externalFinish || '').trim().toUpperCase() === normFinish
    )

    if (matched && matched.price != null && matched.price > 0) {
      return matched.price
    }
  }

  // 2. Fall back to DEFAULT_MATRIX
  const defaultCell = DEFAULT_MATRIX.find(
    (c) =>
      c.code === code &&
      c.hardware.trim().toUpperCase() === normHw &&
      c.coreMaterial.trim().toUpperCase() === normCore &&
      c.externalFinish.trim().toUpperCase() === normFinish
  )

  return defaultCell && defaultCell.price > 0 ? defaultCell.price : null
}
