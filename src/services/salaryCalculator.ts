/**
 * Calculia - Azerbaijan 2026 Advanced Salary and Tax Calculator Engine
 * Compliant with 2026 Tax Code of the Republic of Azerbaijan (AR Vergi Məcəlləsi)
 * and Compulsory Social & Health Insurance Regulations.
 */

export type SectorType = 'private' | 'state';
export type WorkPlaceType = 'main' | 'extra';
export type CalculationDirection = 'gross' | 'net';

export interface TaxBenefitItem {
  id: string;
  amount: number;
  label: string;
  category?: string;
}

export const TAX_BENEFITS_LIST: TaxBenefitItem[] = [
  {
    id: 'benefit-800-martyr',
    amount: 800,
    label: '800 ₼ — Şəhid statusu almış şəxslərin valideynləri, dul arvad/əri və övladları',
  },
  {
    id: 'benefit-400-war-hero',
    amount: 400,
    label: '400 ₼ — Azərbaycan Respublikasının Vətən Müharibəsi Qəhrəmanı',
  },
  {
    id: 'benefit-400-national-hero',
    amount: 400,
    label: '400 ₼ — Azərbaycanın Milli Qəhrəmanı',
  },
  {
    id: 'benefit-400-soviet-hero',
    amount: 400,
    label: '400 ₼ — Sovet İttifaqı / Sosialist Əməyi Qəhrəmanı',
  },
  {
    id: 'benefit-400-disabled-war',
    amount: 400,
    label: '400 ₼ — Müharibə ilə əlaqədar əlilliyi olan şəxs',
  },
  {
    id: 'benefit-400-deceased-soldier',
    amount: 400,
    label: '400 ₼ — Həlak olmuş/vəfat etmiş döyüşçünün dul arvadı/əri və övladı',
  },
  {
    id: 'benefit-400-rear-front',
    amount: 400,
    label: '400 ₼ — 1941–1945 arxa cəbhə orden/medal təltifli şəxs',
  },
  {
    id: 'benefit-400-veteran',
    amount: 400,
    label: '400 ₼ — Qanunvericiliklə müəyyən edilmiş qaydada müharibə veteranı',
  },
  {
    id: 'benefit-400-chernobyl',
    amount: 400,
    label: '400 ₼ — Çernobıl AES / radiasiya qəzaları nəticəsində xəstəliyi olan şəxs',
  },
  {
    id: 'benefit-200-disability',
    amount: 200,
    label: '200 ₼ — 61–100% funksional pozuntu ilə əlilliyi olan şəxs və baxan valideyn',
  },
  {
    id: 'benefit-100-parents',
    amount: 100,
    label: '100 ₼ — Həlak olmuş/vəfat etmiş döyüşçülərin və vəzifə başında həlak olmuş dövlət qulluqçularının valideynləri',
  },
  {
    id: 'benefit-100-afghan',
    amount: 100,
    label: '100 ₼ — Əfqanıstana və döyüş əməliyyatlarına göndərilmiş hərbi qulluqçular',
  },
  {
    id: 'benefit-100-idp',
    amount: 100,
    label: '100 ₼ — Məcburi köçkün və onlara bərabər tutulan şəxs',
  },
  {
    id: 'benefit-50-dependents',
    amount: 50,
    label: '50 ₼ — Himayəsində azı 3 nəfər (23 yaşınadək tələbələr daxil) olan ər və ya arvad',
  },
];

export interface CalculiaInput {
  direction: CalculationDirection;
  amount: number;
  sector: SectorType;
  workPlace: WorkPlaceType;
  unionPercent: number;
  selectedBenefitIds: string[];
  customBenefitsAmount?: number;
}

export interface CalculiaBreakdown {
  gross: number;
  net: number;
  taxableIncome: number;
  generalAllowance: number;
  selectedBenefitsTotal: number;
  incomeTax: number;
  dsmf: number;
  unemployment: number;
  healthInsurance: number;
  unionFee: number;
  totalEmployeeDeductions: number;
  effectiveTaxRate: number;
  // Employer costs (Şirkət xərci)
  employerDsmf: number;
  employerHealthInsurance: number;
  employerUnemployment: number;
  totalEmployerCost: number;
}

/**
 * Calculates all taxes and deductions from a given Gross salary according to 2026 laws.
 */
export function calculateFromGross(
  gross: number,
  sector: SectorType = 'private',
  workPlace: WorkPlaceType = 'main',
  unionPercent: number = 0,
  selectedBenefitIds: string[] = [],
  customBenefitsAmount: number = 0
): CalculiaBreakdown {
  const g = Math.max(0, Number(gross) || 0);

  if (g === 0) {
    return {
      gross: 0,
      net: 0,
      taxableIncome: 0,
      generalAllowance: 0,
      selectedBenefitsTotal: 0,
      incomeTax: 0,
      dsmf: 0,
      unemployment: 0,
      healthInsurance: 0,
      unionFee: 0,
      totalEmployeeDeductions: 0,
      effectiveTaxRate: 0,
      employerDsmf: 0,
      employerHealthInsurance: 0,
      employerUnemployment: 0,
      totalEmployerCost: 0,
    };
  }

  // Calculate sum of selected tax benefits
  let benefitsSum = customBenefitsAmount;
  for (const bId of selectedBenefitIds) {
    const found = TAX_BENEFITS_LIST.find((b) => b.id === bId);
    if (found) {
      benefitsSum += found.amount;
    }
  }

  // 1. General allowance: Main work place gets 200 ₼ deduction if gross <= 2500 ₼
  let generalAllowance = 0;
  if (workPlace === 'main' && g <= 2500) {
    generalAllowance = 200;
  }

  // Taxable income calculation
  let taxable = Math.max(0, g - generalAllowance);
  taxable = Math.max(0, taxable - benefitsSum);

  let incomeTax = 0;
  let dsmf = 0;
  let healthInsurance = 0;
  const unemployment = g * 0.005; // 0.5% for all sectors

  if (sector === 'private') {
    // Qeyri-neft/qaz özəl sektor:
    // Gəlir vergisi (2026):
    // 2500-dək: 3%
    // 2500 - 8000: 75 ₼ + (taxable - 2500) * 10%
    // 8000-dən yuxarı: 625 ₼ + (taxable - 8000) * 14%
    if (taxable <= 2500) {
      incomeTax = taxable * 0.03;
    } else if (taxable <= 8000) {
      incomeTax = 75 + (taxable - 2500) * 0.10;
    } else {
      incomeTax = 625 + (taxable - 8000) * 0.14;
    }

    // DSMF:
    // <= 200: 3%
    // 200 - 8000: 6 ₼ + (g - 200) * 10%
    // > 8000: 786 ₼ + (g - 8000) * 10%
    if (g <= 200) {
      dsmf = g * 0.03;
    } else if (g <= 8000) {
      dsmf = 6 + (g - 200) * 0.10;
    } else {
      dsmf = 786 + (g - 8000) * 0.10;
    }

    // İTS (İcbari Tibbi Sığorta - 2026 dəqiqləşdirilmiş qayda):
    // <= 2500: 2%
    // > 2500: 50 ₼ + (g - 2500) * 0.5% (0.005)
    if (g <= 2500) {
      healthInsurance = g * 0.02;
    } else {
      healthInsurance = 50 + (g - 2500) * 0.005;
    }
  } else {
    // Dövlət və Neft-qaz sektoru:
    // Gəlir vergisi:
    // <= 2500: 14%
    // > 2500: 350 ₼ + (taxable - 2500) * 25%
    if (taxable <= 2500) {
      incomeTax = taxable * 0.14;
    } else {
      incomeTax = 350 + (taxable - 2500) * 0.25;
    }

    // DSMF:
    // <= 200: 3%
    // 200 - 8000: 6 ₼ + (g - 200) * 10%
    // > 8000: 786 ₼ + (g - 8000) * 10%
    if (g <= 200) {
      dsmf = g * 0.03;
    } else if (g <= 8000) {
      dsmf = 6 + (g - 200) * 0.10;
    } else {
      dsmf = 786 + (g - 8000) * 0.10;
    }

    // İTS:
    // <= 8000: 2%
    // > 8000: 160 ₼ + (g - 8000) * 0.5%
    if (g <= 8000) {
      healthInsurance = g * 0.02;
    } else {
      healthInsurance = 160 + (g - 8000) * 0.005;
    }
  }

  // Həmkarlar ittifaqı haqqı
  const validUnionPercent = Math.max(0, Number(unionPercent) || 0);
  const unionFee = g * (validUnionPercent / 100);

  const totalEmployeeDeductions = incomeTax + dsmf + unemployment + healthInsurance + unionFee;
  const net = Math.max(0, g - totalEmployeeDeductions);

  // Employer costs
  // Employer DSMF:
  // Private: <= 200: 22%, > 200: 44 ₼ + (g - 200) * 15%
  // State: 22% of gross
  let employerDsmf = 0;
  if (sector === 'private') {
    if (g <= 200) {
      employerDsmf = g * 0.22;
    } else {
      employerDsmf = 44 + (g - 200) * 0.15;
    }
  } else {
    employerDsmf = g * 0.22;
  }

  // Employer Health Insurance:
  // Private: <= 2500: 2%, > 2500: 50 ₼ + (g - 2500) * 0.5%
  // State: <= 8000: 2%, > 8000: 160 ₼ + (g - 8000) * 0.5%
  let employerHealthInsurance = 0;
  if (sector === 'private') {
    if (g <= 2500) {
      employerHealthInsurance = g * 0.02;
    } else {
      employerHealthInsurance = 50 + (g - 2500) * 0.005;
    }
  } else {
    if (g <= 8000) {
      employerHealthInsurance = g * 0.02;
    } else {
      employerHealthInsurance = 160 + (g - 8000) * 0.005;
    }
  }

  // Employer Unemployment: 0.5%
  const employerUnemployment = g * 0.005;

  const totalEmployerCost = g + employerDsmf + employerHealthInsurance + employerUnemployment;
  const effectiveTaxRate = g > 0 ? (totalEmployeeDeductions / g) * 100 : 0;

  return {
    gross: Math.round(g * 100) / 100,
    net: Math.round(net * 100) / 100,
    taxableIncome: Math.round(taxable * 100) / 100,
    generalAllowance,
    selectedBenefitsTotal: Math.round(benefitsSum * 100) / 100,
    incomeTax: Math.round(incomeTax * 100) / 100,
    dsmf: Math.round(dsmf * 100) / 100,
    unemployment: Math.round(unemployment * 100) / 100,
    healthInsurance: Math.round(healthInsurance * 100) / 100,
    unionFee: Math.round(unionFee * 100) / 100,
    totalEmployeeDeductions: Math.round(totalEmployeeDeductions * 100) / 100,
    effectiveTaxRate: Math.round(effectiveTaxRate * 10) / 10,
    employerDsmf: Math.round(employerDsmf * 100) / 100,
    employerHealthInsurance: Math.round(employerHealthInsurance * 100) / 100,
    employerUnemployment: Math.round(employerUnemployment * 100) / 100,
    totalEmployerCost: Math.round(totalEmployerCost * 100) / 100,
  };
}

/**
 * Calculates Gross and all deductions given a target NET salary using high precision binary search.
 */
export function calculateFromNet(
  targetNet: number,
  sector: SectorType = 'private',
  workPlace: WorkPlaceType = 'main',
  unionPercent: number = 0,
  selectedBenefitIds: string[] = [],
  customBenefitsAmount: number = 0
): CalculiaBreakdown {
  const target = Math.max(0, Number(targetNet) || 0);

  if (target === 0) {
    return calculateFromGross(0, sector, workPlace, unionPercent, selectedBenefitIds, customBenefitsAmount);
  }

  let lo = target;
  let hi = Math.max(target * 3, 1000);

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const r = calculateFromGross(mid, sector, workPlace, unionPercent, selectedBenefitIds, customBenefitsAmount);
    if (Math.abs(r.net - target) < 0.005) {
      return r;
    }
    if (r.net < target) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return calculateFromGross((lo + hi) / 2, sector, workPlace, unionPercent, selectedBenefitIds, customBenefitsAmount);
}

/**
 * Backwards compatibility helper
 */
export function calculateNetSalary(gross: number) {
  return calculateFromGross(gross, 'private', 'main', 0, []);
}

/**
 * Backwards compatibility helper to get gross from net as number
 */
export function calculateGrossFromNet(net: number): number {
  const result = calculateFromNet(net, 'private', 'main', 0, []);
  return result.gross;
}

/**
 * Format number as Azerbaijani Manat (AZN) currency string
 */
export function formatAZN(amount: number): string {
  return new Intl.NumberFormat('az-AZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.max(0, amount)) + ' ₼';
}
