import { Product } from '@/types/product';

export interface CategoryInfo {
  title: string;
  tags: string[];
  description?: string;
}

export const categoryMapping: Record<string, CategoryInfo> = {
  'spare-parts': {
    title: 'อะไหล่เครื่องจักร (Spare Parts)',
    description: 'อะไหล่และชิ้นส่วนสำหรับเครื่องจักรอุตสาหกรรม',
    tags: [
      'Mechanical & Power Transmission Systems',
      'Fluid & Pneumatic Systems', 
      'Electrical & Control Hardware'
    ]
  },
  'plc-scada': {
    title: 'ระบบควบคุมและออโตเมชัน (PLC/SCADA/Automation)',
    description: 'ระบบควบคุมอัตโนมัติและระบบ SCADA สำหรับอุตสาหกรรม',
    tags: [
      'Core Controllers & Logic',
      'Actuators & Motion Control',
      'Networking & Data Communication',
      'Specialised & Integrated Systems'
    ]
  },
  'instrumentation': {
    title: 'Instrumentation & Measurement',
    description: 'เครื่องมือวัดและระบบควบคุมทางอุตสาหกรรม',
    tags: [
      'Pressure & Flow Control',
      'Temperature & Level Control',
      'Analysis & Safety Systems'
    ]
  }
};

// Normalize helper to make tag comparisons robust to spacing/case differences
const normalize = (value: string | undefined | null) =>
  (value || '').trim().toLowerCase();

export const getCategoryByTag = (tag: string): string | null => {
  const nTag = normalize(tag);
  for (const [categoryKey, categoryInfo] of Object.entries(categoryMapping)) {
    const tagSet = new Set(categoryInfo.tags.map(t => normalize(t)));
    if (tagSet.has(nTag)) return categoryKey;
  }
  return null;
};

export const groupProductsByCategory = (products: Product[]): Record<string, Product[]> => {
  const grouped: Record<string, Product[]> = {};
  
  Object.keys(categoryMapping).forEach(key => {
    grouped[key] = [];
  });
  
  products.forEach(product => {
    const categoryKey = getCategoryByTag(product.tag);
    if (categoryKey && grouped[categoryKey]) {
      grouped[categoryKey].push(product);
    }
  });
  
  return grouped;
};

export const getProductsByCategory = (products: Product[], categoryKey: string): Product[] => {
  const categoryInfo = categoryMapping[categoryKey];
  if (!categoryInfo) return [];

  const normalizedTags = categoryInfo.tags.map(t => normalize(t));
  const filteredProducts = products.filter(product =>
    normalizedTags.includes(normalize(product.tag))
  );

  return filteredProducts.sort((a, b) => {
    const tagIndexA = normalizedTags.indexOf(normalize(a.tag));
    const tagIndexB = normalizedTags.indexOf(normalize(b.tag));
    
    if (tagIndexA !== tagIndexB) {
      return tagIndexA - tagIndexB;
    }
    
    return a.name.localeCompare(b.name);
  });
};

export const getAvailableCategories = (products: Product[]): string[] => {
  const grouped = groupProductsByCategory(products);
  return Object.keys(grouped).filter(key => grouped[key].length > 0);
};

export const groupProductsByTagInCategory = (products: Product[], categoryKey: string): Record<string, Product[]> => {
  const categoryProducts = getProductsByCategory(products, categoryKey);
  const groupedByTag: Record<string, Product[]> = {};
  
  categoryProducts.forEach(product => {
    if (!groupedByTag[product.tag]) {
      groupedByTag[product.tag] = [];
    }
    groupedByTag[product.tag].push(product);
  });
  
  const categoryInfo = categoryMapping[categoryKey];
  if (categoryInfo) {
    const orderedGroups: Record<string, Product[]> = {};
    categoryInfo.tags.forEach(tag => {
      if (groupedByTag[tag]) {
        orderedGroups[tag] = groupedByTag[tag].sort((a, b) => a.name.localeCompare(b.name));
      }
    });
    return orderedGroups;
  }
  
  return groupedByTag;
};