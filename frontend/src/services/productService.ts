import { Product, ProductsResponse, ProductFilters } from '@/types/product';

// Base API URL (จะเปลี่ยนเป็น environment variable ตอนต่อ database จริง)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Product API functions (เตรียมไว้สำหรับต่อ database)
export const productAPI = {
  // Get all products with filters
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  async getProductById(id: number): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};

// Mock data สำหรับการทดสอบ (จะลบออกเมื่อต่อ database จริง)
export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Bearing & Roller",
    tag: "Mechanical & Power Transmission Systems",
    image: "/homepage/products/bearings-and-rollers.webp",
    category: "spare-parts",
    price: 2500,
    inStock: true
  },
  {
    id: 2,
    name: "Industrial Belt & Chain",
    tag: "Mechanical & Power Transmission Systems", 
    image: "/homepage/products/motor-and-drive.webp",
    category: "spare-parts",
    price: 1800,
    inStock: true
  },
  {
    id: 3,
    name: "Gearbox & Reducer",
    tag: "Mechanical & Power Transmission Systems",
    image: "/homepage/products/hydraulic-system.webp",
    category: "systems",
    price: 15000,
    inStock: true
  },
  {
    id: 4,
    name: "Coupling & Shaft",
    tag: "Mechanical & Power Transmission Systems",
    image: "/homepage/products/plc-module.webp",
    category: "automation",
    price: 8500,
    inStock: false
  },
  {
    id: 5,
    name: "Conveyor Parts",
    tag: "Mechanical & Power Transmission Systems",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 6,
    name: "Industrial Seal & Gasket",
    tag: "Mechanical & Power Transmission Systems",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 7,
    name: "Hydraulic Cylinder & Pump",
    tag: "Fluid & Pneumatic Systems",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 8,
    name: "Pneumatic Valve & Cylinder",
    tag: "Fluid & Pneumatic Systems",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 9,
    name: "Pump (Centrifugal / Submersible / Gear Pump)",
    tag: "Fluid & Pneumatic Systems",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 9,
    name: "Electric Motor",
    tag: "Electrical & Control Hardware",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 10,
    name: "Panel & Protection Components",
    tag: "Electrical & Control Hardware",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 11,
    name: "Specialized Hardware (Explosion Proof Equipment)",
    tag: "Electrical & Control Hardware",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 12,
    name: "PLC Module",
    tag: "Core Controllers & Logic",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 13,
    name: "SCADA Software & License",
    tag: "Core Controllers & Logic",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 14,
    name: "HMI Panel",
    tag: "Core Controllers & Logic",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 15,
    name: "Industrial PC & Panel PC",
    tag: "Core Controllers & Logic",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 16,
    name: "VFD (Variable Frequency Drive)",
    tag: "Actuators & Motion Control",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 17,
    name: "Servo Motor & Drive System",
    tag: "Actuators & Motion Control",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 18,
    name: "Remote I/O Module",
    tag: "Networking & Data Communication",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
   {
    id: 19,
    name: "Industrial Network Switch & Gateway",
    tag: "Networking & Data Communication",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 20,
    name: "Robot Arm Integration",
    tag: "Specialised & Integrated Systems",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 21,
    name: "Control Cabinet Design & Fabrication",
    tag: "Specialised & Integrated Systems",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 22,
    name: "Pressure Transmitter / Pressure Gauge",
    tag: "Pressure & Flow Control",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 23,
    name: "Flowmeter",
    tag: "Pressure & Flow Control",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 24,
    name: "Temperature Sensor & Transmitter",
    tag: "Temperature & Level Control",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 25,
    name: "Level Sensor",
    tag: "Temperature & Level Control",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  },
  {
    id: 26,
    name: "Gas Detector & Analyzer",
    tag: "Analysis & Safety Systems",
    image: "/homepage/products/pressure-and-flow.webp",
    category: "systems",
    price: 5200,
    inStock: true
  }
];