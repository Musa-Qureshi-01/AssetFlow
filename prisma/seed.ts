/**
 * Prisma Seed — Odoo Asset
 * Tech company: 12 employees, 30 assets, full operational data
 * Run: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PASS = await bcrypt.hash("Admin@1234", 10); // all demo accounts share this password

async function main() {
  console.log("🌱 Starting seed...");

  // ─── 1. Departments ──────────────────────────────────────────────────────────
  console.log("  → Departments");

  const deptEngineering = await prisma.department.upsert({
    where: { code: "ENG" },
    update: {},
    create: { code: "ENG", name: "Engineering", description: "Software & systems engineering", location: "Floor 3" },
  });
  const deptProduct = await prisma.department.upsert({
    where: { code: "PRD" },
    update: {},
    create: { code: "PRD", name: "Product", description: "Product management & design", location: "Floor 2" },
  });
  const deptOperations = await prisma.department.upsert({
    where: { code: "OPS" },
    update: {},
    create: { code: "OPS", name: "Operations", description: "IT ops & infrastructure", location: "Floor 1" },
  });
  const deptFinance = await prisma.department.upsert({
    where: { code: "FIN" },
    update: {},
    create: { code: "FIN", name: "Finance", description: "Finance & accounting", location: "Floor 4" },
  });
  const deptHR = await prisma.department.upsert({
    where: { code: "HR" },
    update: {},
    create: { code: "HR", name: "Human Resources", description: "People & talent", location: "Floor 2" },
  });

  // ─── 2. Users ─────────────────────────────────────────────────────────────────
  console.log("  → Users");

  const musa = await prisma.user.upsert({
    where: { email: "musaqureshi788code@gmail.com" },
    update: {},
    create: {
      employeeCode: "EMP-0001",
      name: "Musa Qureshi",
      email: "musaqureshi788code@gmail.com",
      passwordHash: PASS,
      role: "ADMIN",
      status: "ACTIVE",
      designation: "System Administrator",
      departmentId: deptOperations.id,
      emailVerifiedAt: new Date(),
    },
  });

  const muskan = await prisma.user.upsert({
    where: { email: "kawadkarmuskan4@gmail.com" },
    update: {},
    create: {
      employeeCode: "EMP-0002",
      name: "Muskan Kawadkar",
      email: "kawadkarmuskan4@gmail.com",
      passwordHash: PASS,
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      designation: "Head of Engineering",
      departmentId: deptEngineering.id,
      emailVerifiedAt: new Date(),
    },
  });

  const aarav = await prisma.user.upsert({
    where: { email: "aarav.sharma@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0003",
      name: "Aarav Sharma",
      email: "aarav.sharma@company.dev",
      passwordHash: PASS,
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      designation: "Head of Operations",
      departmentId: deptOperations.id,
      emailVerifiedAt: new Date(),
    },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya.mehta@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0004",
      name: "Priya Mehta",
      email: "priya.mehta@company.dev",
      passwordHash: PASS,
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      designation: "Head of Finance",
      departmentId: deptFinance.id,
      emailVerifiedAt: new Date(),
    },
  });

  const neha = await prisma.user.upsert({
    where: { email: "neha.singh@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0005",
      name: "Neha Singh",
      email: "neha.singh@company.dev",
      passwordHash: PASS,
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      designation: "Head of HR",
      departmentId: deptHR.id,
      emailVerifiedAt: new Date(),
    },
  });

  const rohan = await prisma.user.upsert({
    where: { email: "rohan.patel@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0006",
      name: "Rohan Patel",
      email: "rohan.patel@company.dev",
      passwordHash: PASS,
      role: "ASSET_MANAGER",
      status: "ACTIVE",
      designation: "Asset Manager",
      departmentId: deptOperations.id,
      emailVerifiedAt: new Date(),
    },
  });

  const ananya = await prisma.user.upsert({
    where: { email: "ananya.verma@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0007",
      name: "Ananya Verma",
      email: "ananya.verma@company.dev",
      passwordHash: PASS,
      role: "ASSET_MANAGER",
      status: "ACTIVE",
      designation: "Asset Manager",
      departmentId: deptOperations.id,
      emailVerifiedAt: new Date(),
    },
  });

  const arjun = await prisma.user.upsert({
    where: { email: "arjun.gupta@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0008",
      name: "Arjun Gupta",
      email: "arjun.gupta@company.dev",
      passwordHash: PASS,
      role: "EMPLOYEE",
      status: "ACTIVE",
      designation: "Senior Software Engineer",
      departmentId: deptEngineering.id,
      emailVerifiedAt: new Date(),
    },
  });

  const kavya = await prisma.user.upsert({
    where: { email: "kavya.nair@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0009",
      name: "Kavya Nair",
      email: "kavya.nair@company.dev",
      passwordHash: PASS,
      role: "EMPLOYEE",
      status: "ACTIVE",
      designation: "Product Designer",
      departmentId: deptProduct.id,
      emailVerifiedAt: new Date(),
    },
  });

  const aditya = await prisma.user.upsert({
    where: { email: "aditya.joshi@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0010",
      name: "Aditya Joshi",
      email: "aditya.joshi@company.dev",
      passwordHash: PASS,
      role: "EMPLOYEE",
      status: "ACTIVE",
      designation: "DevOps Engineer",
      departmentId: deptEngineering.id,
      emailVerifiedAt: new Date(),
    },
  });

  const sneha = await prisma.user.upsert({
    where: { email: "sneha.kapoor@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0011",
      name: "Sneha Kapoor",
      email: "sneha.kapoor@company.dev",
      passwordHash: PASS,
      role: "EMPLOYEE",
      status: "ACTIVE",
      designation: "Financial Analyst",
      departmentId: deptFinance.id,
      emailVerifiedAt: new Date(),
    },
  });

  const rahul = await prisma.user.upsert({
    where: { email: "rahul.iyer@company.dev" },
    update: {},
    create: {
      employeeCode: "EMP-0012",
      name: "Rahul Iyer",
      email: "rahul.iyer@company.dev",
      passwordHash: PASS,
      role: "EMPLOYEE",
      status: "ACTIVE",
      designation: "HR Specialist",
      departmentId: deptHR.id,
      emailVerifiedAt: new Date(),
    },
  });

  // Set department heads
  await prisma.department.update({ where: { id: deptEngineering.id }, data: { headId: muskan.id } });
  await prisma.department.update({ where: { id: deptOperations.id }, data: { headId: aarav.id } });
  await prisma.department.update({ where: { id: deptFinance.id },    data: { headId: priya.id } });
  await prisma.department.update({ where: { id: deptHR.id },         data: { headId: neha.id } });

  // ─── 3. Asset Categories ─────────────────────────────────────────────────────
  console.log("  → Asset Categories");

  const catLaptop = await prisma.assetCategory.upsert({
    where: { code: "LAPTOPS" },
    update: {},
    create: { code: "LAPTOPS", name: "Laptops", description: "Portable computing devices", type: "IT_EQUIPMENT" },
  });
  const catMonitor = await prisma.assetCategory.upsert({
    where: { code: "MONITORS" },
    update: {},
    create: { code: "MONITORS", name: "Monitors", description: "Display screens", type: "IT_EQUIPMENT" },
  });
  const catMobile = await prisma.assetCategory.upsert({
    where: { code: "MOBILES" },
    update: {},
    create: { code: "MOBILES", name: "Mobile Devices", description: "Phones and tablets", type: "IT_EQUIPMENT" },
  });
  const catNetwork = await prisma.assetCategory.upsert({
    where: { code: "NETWORK" },
    update: {},
    create: { code: "NETWORK", name: "Networking", description: "Routers, switches, APs", type: "IT_EQUIPMENT" },
  });
  const catFurniture = await prisma.assetCategory.upsert({
    where: { code: "FURNITURE" },
    update: {},
    create: { code: "FURNITURE", name: "Office Furniture", description: "Desks and chairs", type: "FURNITURE" },
  });
  const catMeetingRoom = await prisma.assetCategory.upsert({
    where: { code: "MEETING" },
    update: {},
    create: { code: "MEETING", name: "Meeting Room Equipment", description: "Displays, cameras, projectors", type: "IT_EQUIPMENT", isSharedResource: true },
  });
  const catPeripherals = await prisma.assetCategory.upsert({
    where: { code: "PERIPH" },
    update: {},
    create: { code: "PERIPH", name: "Peripherals", description: "Keyboards, mice, webcams, docks", type: "IT_EQUIPMENT" },
  });
  const catDevHardware = await prisma.assetCategory.upsert({
    where: { code: "DEVHW" },
    update: {},
    create: { code: "DEVHW", name: "Development Hardware", description: "Workstations, servers, NAS", type: "IT_EQUIPMENT" },
  });

  // ─── 4. Assets (~30) ─────────────────────────────────────────────────────────
  console.log("  → Assets");

  const acqDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400_000);

  const assets = await Promise.all([
    // Laptops
    prisma.asset.upsert({ where: { assetTag: "AST-LT-001" }, update: {}, create: { assetTag: "AST-LT-001", name: "MacBook Pro M3 14\"", categoryId: catLaptop.id, serialNumber: "C02ZT1ABMD6T", acquisitionDate: acqDate(120), acquisitionCost: 199900, condition: "NEW", currentStatus: "ALLOCATED", currentLocation: "Floor 3 — Eng Zone", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-LT-002" }, update: {}, create: { assetTag: "AST-LT-002", name: "MacBook Pro M3 14\"", categoryId: catLaptop.id, serialNumber: "C02ZT2BCMD6T", acquisitionDate: acqDate(120), acquisitionCost: 199900, condition: "GOOD", currentStatus: "ALLOCATED", currentLocation: "Floor 3 — Eng Zone", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-LT-003" }, update: {}, create: { assetTag: "AST-LT-003", name: "MacBook Air M2", categoryId: catLaptop.id, serialNumber: "C02ZT3CDMD6T", acquisitionDate: acqDate(200), acquisitionCost: 129900, condition: "GOOD", currentStatus: "ALLOCATED", currentLocation: "Floor 2 — Product Zone", departmentOwnerId: deptProduct.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-LT-004" }, update: {}, create: { assetTag: "AST-LT-004", name: "Dell XPS 15", categoryId: catLaptop.id, serialNumber: "DL-XPS15-9520-A4", acquisitionDate: acqDate(300), acquisitionCost: 179900, condition: "GOOD", currentStatus: "ALLOCATED", currentLocation: "Floor 1 — Ops Zone", departmentOwnerId: deptOperations.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-LT-005" }, update: {}, create: { assetTag: "AST-LT-005", name: "Lenovo ThinkPad X1 Carbon", categoryId: catLaptop.id, serialNumber: "LN-X1C-G11-B5", acquisitionDate: acqDate(180), acquisitionCost: 149900, condition: "GOOD", currentStatus: "ALLOCATED", currentLocation: "Floor 4 — Finance Zone", departmentOwnerId: deptFinance.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-LT-006" }, update: {}, create: { assetTag: "AST-LT-006", name: "HP EliteBook 840 G10", categoryId: catLaptop.id, serialNumber: "HP-EB840-G10-C6", acquisitionDate: acqDate(90), acquisitionCost: 139900, condition: "NEW", currentStatus: "AVAILABLE", currentLocation: "IT Storage Room", departmentOwnerId: deptOperations.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-LT-007" }, update: {}, create: { assetTag: "AST-LT-007", name: "MacBook Air M2", categoryId: catLaptop.id, serialNumber: "C02ZT7GHMD6T", acquisitionDate: acqDate(365), acquisitionCost: 129900, condition: "FAIR", currentStatus: "UNDER_MAINTENANCE", currentLocation: "IT Workshop", departmentOwnerId: deptHR.id } }),

    // Monitors
    prisma.asset.upsert({ where: { assetTag: "AST-MN-001" }, update: {}, create: { assetTag: "AST-MN-001", name: "Dell UltraSharp U2723D", categoryId: catMonitor.id, serialNumber: "DL-U2723D-001", acquisitionDate: acqDate(150), acquisitionCost: 59900, condition: "NEW", currentStatus: "ALLOCATED", currentLocation: "Floor 3", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-MN-002" }, update: {}, create: { assetTag: "AST-MN-002", name: "LG UltraWide 34\" QHD", categoryId: catMonitor.id, serialNumber: "LG-34WP85C-002", acquisitionDate: acqDate(150), acquisitionCost: 74900, condition: "GOOD", currentStatus: "ALLOCATED", currentLocation: "Floor 3", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-MN-003" }, update: {}, create: { assetTag: "AST-MN-003", name: "Dell UltraSharp U2723D", categoryId: catMonitor.id, serialNumber: "DL-U2723D-003", acquisitionDate: acqDate(90), acquisitionCost: 59900, condition: "NEW", currentStatus: "AVAILABLE", currentLocation: "IT Storage Room", departmentOwnerId: deptOperations.id } }),

    // Mobile Devices
    prisma.asset.upsert({ where: { assetTag: "AST-MB-001" }, update: {}, create: { assetTag: "AST-MB-001", name: "iPhone 15 Pro", categoryId: catMobile.id, serialNumber: "IP15P-F2VXQ-001", acquisitionDate: acqDate(100), acquisitionCost: 134900, condition: "NEW", currentStatus: "ALLOCATED", currentLocation: "Floor 3", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-MB-002" }, update: {}, create: { assetTag: "AST-MB-002", name: "Samsung Galaxy S24 Ultra", categoryId: catMobile.id, serialNumber: "SG-S24U-QR22-002", acquisitionDate: acqDate(60), acquisitionCost: 124900, condition: "NEW", currentStatus: "ALLOCATED", currentLocation: "Floor 4", departmentOwnerId: deptFinance.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-MB-003" }, update: {}, create: { assetTag: "AST-MB-003", name: "iPad Air 5th Gen", categoryId: catMobile.id, serialNumber: "IP-AIR5-GH44-003", acquisitionDate: acqDate(200), acquisitionCost: 74900, condition: "GOOD", currentStatus: "AVAILABLE", currentLocation: "IT Storage Room", departmentOwnerId: deptOperations.id, sharedResource: true } }),

    // Networking
    prisma.asset.upsert({ where: { assetTag: "AST-NW-001" }, update: {}, create: { assetTag: "AST-NW-001", name: "Cisco Catalyst 2960-X Switch", categoryId: catNetwork.id, serialNumber: "CS-2960X-001", acquisitionDate: acqDate(400), acquisitionCost: 89900, condition: "GOOD", currentStatus: "IN_USE", currentLocation: "Server Room", departmentOwnerId: deptOperations.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-NW-002" }, update: {}, create: { assetTag: "AST-NW-002", name: "Cisco ISR 4331 Router", categoryId: catNetwork.id, serialNumber: "CS-ISR4331-002", acquisitionDate: acqDate(400), acquisitionCost: 149900, condition: "GOOD", currentStatus: "IN_USE", currentLocation: "Server Room", departmentOwnerId: deptOperations.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-NW-003" }, update: {}, create: { assetTag: "AST-NW-003", name: "Ubiquiti UniFi AP Pro", categoryId: catNetwork.id, serialNumber: "UF-UAP-PRO-003", acquisitionDate: acqDate(250), acquisitionCost: 24900, condition: "GOOD", currentStatus: "IN_USE", currentLocation: "Floor 3 Ceiling", departmentOwnerId: deptOperations.id } }),

    // Office Furniture
    prisma.asset.upsert({ where: { assetTag: "AST-FN-001" }, update: {}, create: { assetTag: "AST-FN-001", name: "Flexispot E7 Standing Desk", categoryId: catFurniture.id, serialNumber: "FX-E7-001", acquisitionDate: acqDate(180), acquisitionCost: 59900, condition: "GOOD", currentStatus: "IN_USE", currentLocation: "Floor 3 — Desk 12", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-FN-002" }, update: {}, create: { assetTag: "AST-FN-002", name: "Herman Miller Aeron Chair", categoryId: catFurniture.id, serialNumber: "HM-AERON-002", acquisitionDate: acqDate(365), acquisitionCost: 149900, condition: "GOOD", currentStatus: "IN_USE", currentLocation: "Floor 3 — Desk 12", departmentOwnerId: deptEngineering.id } }),

    // Meeting Room Equipment
    prisma.asset.upsert({ where: { assetTag: "AST-MR-001" }, update: {}, create: { assetTag: "AST-MR-001", name: "Samsung 65\" QN90C Display", categoryId: catMeetingRoom.id, serialNumber: "SM-QN90C-001", acquisitionDate: acqDate(120), acquisitionCost: 199900, condition: "NEW", currentStatus: "IN_USE", currentLocation: "Conf Room A", departmentOwnerId: deptOperations.id, sharedResource: true } }),
    prisma.asset.upsert({ where: { assetTag: "AST-MR-002" }, update: {}, create: { assetTag: "AST-MR-002", name: "Poly Studio X70 Camera", categoryId: catMeetingRoom.id, serialNumber: "PL-X70-002", acquisitionDate: acqDate(120), acquisitionCost: 99900, condition: "NEW", currentStatus: "IN_USE", currentLocation: "Conf Room A", departmentOwnerId: deptOperations.id, sharedResource: true } }),
    prisma.asset.upsert({ where: { assetTag: "AST-MR-003" }, update: {}, create: { assetTag: "AST-MR-003", name: "Epson EB-L735U Projector", categoryId: catMeetingRoom.id, serialNumber: "EP-L735U-003", acquisitionDate: acqDate(300), acquisitionCost: 149900, condition: "FAIR", currentStatus: "IN_USE", currentLocation: "Conf Room B", departmentOwnerId: deptOperations.id, sharedResource: true } }),

    // Peripherals
    prisma.asset.upsert({ where: { assetTag: "AST-PR-001" }, update: {}, create: { assetTag: "AST-PR-001", name: "Logitech MX Keys S", categoryId: catPeripherals.id, serialNumber: "LG-MXKS-001", acquisitionDate: acqDate(90), acquisitionCost: 12900, condition: "NEW", currentStatus: "ALLOCATED", currentLocation: "Floor 3", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-PR-002" }, update: {}, create: { assetTag: "AST-PR-002", name: "Logitech MX Master 3S", categoryId: catPeripherals.id, serialNumber: "LG-MXM3S-002", acquisitionDate: acqDate(90), acquisitionCost: 9900, condition: "NEW", currentStatus: "ALLOCATED", currentLocation: "Floor 3", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-PR-003" }, update: {}, create: { assetTag: "AST-PR-003", name: "CalDigit TS4 Thunderbolt Dock", categoryId: catPeripherals.id, serialNumber: "CD-TS4-003", acquisitionDate: acqDate(100), acquisitionCost: 34900, condition: "NEW", currentStatus: "ALLOCATED", currentLocation: "Floor 3", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-PR-004" }, update: {}, create: { assetTag: "AST-PR-004", name: "Logitech Brio 500 Webcam", categoryId: catPeripherals.id, serialNumber: "LG-BRIO500-004", acquisitionDate: acqDate(60), acquisitionCost: 8900, condition: "NEW", currentStatus: "AVAILABLE", currentLocation: "IT Storage Room", departmentOwnerId: deptOperations.id } }),

    // Development Hardware
    prisma.asset.upsert({ where: { assetTag: "AST-DH-001" }, update: {}, create: { assetTag: "AST-DH-001", name: "Mac Pro M2 Ultra Developer Workstation", categoryId: catDevHardware.id, serialNumber: "MP-M2U-001", acquisitionDate: acqDate(60), acquisitionCost: 699900, condition: "NEW", currentStatus: "IN_USE", currentLocation: "Floor 3 — DevLab", departmentOwnerId: deptEngineering.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-DH-002" }, update: {}, create: { assetTag: "AST-DH-002", name: "Synology DS923+ NAS", categoryId: catDevHardware.id, serialNumber: "SY-DS923P-002", acquisitionDate: acqDate(180), acquisitionCost: 89900, condition: "GOOD", currentStatus: "IN_USE", currentLocation: "Server Room", departmentOwnerId: deptOperations.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-DH-003" }, update: {}, create: { assetTag: "AST-DH-003", name: "APC Smart-UPS 1500VA", categoryId: catDevHardware.id, serialNumber: "APC-SMT1500-003", acquisitionDate: acqDate(400), acquisitionCost: 39900, condition: "FAIR", currentStatus: "IN_USE", currentLocation: "Server Room", departmentOwnerId: deptOperations.id } }),
    prisma.asset.upsert({ where: { assetTag: "AST-DH-004" }, update: {}, create: { assetTag: "AST-DH-004", name: "42U Server Rack Cabinet", categoryId: catDevHardware.id, serialNumber: "SR-42U-GN-004", acquisitionDate: acqDate(500), acquisitionCost: 59900, condition: "GOOD", currentStatus: "IN_USE", currentLocation: "Server Room", departmentOwnerId: deptOperations.id } }),
  ]);

  // Map by asset tag for easy reference below
  const a = Object.fromEntries(assets.map(a => [a.assetTag, a]));

  // ─── 5. Allocations ──────────────────────────────────────────────────────────
  console.log("  → Allocations");

  const now = new Date();
  const future = (days: number) => new Date(now.getTime() + days * 86400_000);
  const past = (days: number) => new Date(now.getTime() - days * 86400_000);

  // Active allocations
  await prisma.assetAllocation.createMany({ skipDuplicates: true, data: [
    { assetId: a["AST-LT-001"].id, targetType: "EMPLOYEE", targetEmployeeId: musa.id, targetDepartmentId: deptEngineering.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(120), approvedAt: past(119), allocatedAt: past(119), expectedReturnDate: future(60) },
    { assetId: a["AST-LT-002"].id, targetType: "EMPLOYEE", targetEmployeeId: arjun.id, targetDepartmentId: deptEngineering.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(100), approvedAt: past(99), allocatedAt: past(99), expectedReturnDate: future(80) },
    { assetId: a["AST-LT-003"].id, targetType: "EMPLOYEE", targetEmployeeId: kavya.id, targetDepartmentId: deptProduct.id, allocatedById: ananya.id, approvedById: ananya.id, status: "ACTIVE", requestedAt: past(200), approvedAt: past(199), allocatedAt: past(199), expectedReturnDate: future(40) },
    { assetId: a["AST-LT-004"].id, targetType: "EMPLOYEE", targetEmployeeId: aarav.id, targetDepartmentId: deptOperations.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(300), approvedAt: past(299), allocatedAt: past(299), expectedReturnDate: future(30) },
    { assetId: a["AST-LT-005"].id, targetType: "EMPLOYEE", targetEmployeeId: sneha.id, targetDepartmentId: deptFinance.id, allocatedById: ananya.id, approvedById: ananya.id, status: "ACTIVE", requestedAt: past(180), approvedAt: past(179), allocatedAt: past(179), expectedReturnDate: future(90) },
    { assetId: a["AST-MN-001"].id, targetType: "EMPLOYEE", targetEmployeeId: arjun.id, targetDepartmentId: deptEngineering.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(150), approvedAt: past(149), allocatedAt: past(149), expectedReturnDate: future(120) },
    { assetId: a["AST-MN-002"].id, targetType: "EMPLOYEE", targetEmployeeId: aditya.id, targetDepartmentId: deptEngineering.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(150), approvedAt: past(149), allocatedAt: past(149), expectedReturnDate: future(120) },
    { assetId: a["AST-MB-001"].id, targetType: "EMPLOYEE", targetEmployeeId: muskan.id, targetDepartmentId: deptEngineering.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(100), approvedAt: past(99), allocatedAt: past(99), expectedReturnDate: future(200) },
    { assetId: a["AST-MB-002"].id, targetType: "EMPLOYEE", targetEmployeeId: priya.id, targetDepartmentId: deptFinance.id, allocatedById: ananya.id, approvedById: ananya.id, status: "ACTIVE", requestedAt: past(60), approvedAt: past(59), allocatedAt: past(59), expectedReturnDate: future(240) },
    { assetId: a["AST-PR-001"].id, targetType: "EMPLOYEE", targetEmployeeId: arjun.id, targetDepartmentId: deptEngineering.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(90), approvedAt: past(89), allocatedAt: past(89), expectedReturnDate: future(180) },
    { assetId: a["AST-PR-002"].id, targetType: "EMPLOYEE", targetEmployeeId: arjun.id, targetDepartmentId: deptEngineering.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(90), approvedAt: past(89), allocatedAt: past(89), expectedReturnDate: future(180) },
    { assetId: a["AST-PR-003"].id, targetType: "EMPLOYEE", targetEmployeeId: musa.id, targetDepartmentId: deptOperations.id, allocatedById: ananya.id, approvedById: ananya.id, status: "ACTIVE", requestedAt: past(100), approvedAt: past(99), allocatedAt: past(99), expectedReturnDate: future(180) },
    // Overdue allocations (expectedReturnDate in the past)
    { assetId: a["AST-LT-006"].id, targetType: "EMPLOYEE", targetEmployeeId: rahul.id, targetDepartmentId: deptHR.id, allocatedById: ananya.id, approvedById: ananya.id, status: "ACTIVE", requestedAt: past(200), approvedAt: past(199), allocatedAt: past(199), expectedReturnDate: past(30) },
    { assetId: a["AST-PR-003"].id, targetType: "EMPLOYEE", targetEmployeeId: neha.id, targetDepartmentId: deptHR.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(300), approvedAt: past(299), allocatedAt: past(299), expectedReturnDate: past(14) },
    { assetId: a["AST-MB-003"].id, targetType: "DEPARTMENT", targetDepartmentId: deptProduct.id, allocatedById: rohan.id, approvedById: rohan.id, status: "ACTIVE", requestedAt: past(180), approvedAt: past(179), allocatedAt: past(179), expectedReturnDate: past(7) },
    // Pending transfer requests
    { assetId: a["AST-LT-006"].id, targetType: "DEPARTMENT", targetDepartmentId: deptFinance.id, allocatedById: priya.id, status: "PENDING_TRANSFER", requestedAt: past(5), expectedReturnDate: future(30) },
    { assetId: a["AST-MN-003"].id, targetType: "DEPARTMENT", targetDepartmentId: deptEngineering.id, allocatedById: muskan.id, status: "PENDING_TRANSFER", requestedAt: past(3), expectedReturnDate: future(45) },
    { assetId: a["AST-PR-004"].id, targetType: "EMPLOYEE", targetEmployeeId: kavya.id, targetDepartmentId: deptProduct.id, allocatedById: kavya.id, status: "PENDING_TRANSFER", requestedAt: past(2), expectedReturnDate: future(90) },
    { assetId: a["AST-MB-003"].id, targetType: "DEPARTMENT", targetDepartmentId: deptHR.id, allocatedById: neha.id, status: "PENDING_TRANSFER", requestedAt: past(1), expectedReturnDate: future(60) },
  ]});

  // ─── 6. Resource Bookings ────────────────────────────────────────────────────
  console.log("  → Bookings");

  await prisma.resourceBooking.createMany({ skipDuplicates: true, data: [
    { assetId: a["AST-MR-001"].id, createdById: musa.id, departmentId: deptEngineering.id, purpose: "Engineering All-Hands Q3", startTime: future(2), endTime: new Date(future(2).getTime() + 2 * 3600_000), status: "CONFIRMED" },
    { assetId: a["AST-MR-002"].id, createdById: musa.id, departmentId: deptEngineering.id, purpose: "Engineering All-Hands Q3", startTime: future(2), endTime: new Date(future(2).getTime() + 2 * 3600_000), status: "CONFIRMED" },
    { assetId: a["AST-MR-001"].id, createdById: aarav.id, departmentId: deptOperations.id, purpose: "Vendor Review Meeting", startTime: future(5), endTime: new Date(future(5).getTime() + 3600_000), status: "CONFIRMED" },
    { assetId: a["AST-MR-003"].id, createdById: priya.id, departmentId: deptFinance.id, purpose: "Budget Planning Presentation", startTime: future(7), endTime: new Date(future(7).getTime() + 2 * 3600_000), status: "PENDING" },
    { assetId: a["AST-MB-003"].id, createdById: kavya.id, departmentId: deptProduct.id, purpose: "User Research Session", startTime: future(3), endTime: new Date(future(3).getTime() + 4 * 3600_000), status: "CONFIRMED" },
    // Ongoing
    { assetId: a["AST-MR-002"].id, createdById: neha.id, departmentId: deptHR.id, purpose: "New Hire Onboarding Session", startTime: past(1), endTime: future(1), status: "CONFIRMED" },
    // Completed
    { assetId: a["AST-MR-001"].id, createdById: muskan.id, departmentId: deptEngineering.id, purpose: "Sprint Planning — Q3", startTime: past(7), endTime: new Date(past(7).getTime() + 3600_000), status: "COMPLETED" },
    { assetId: a["AST-MR-003"].id, createdById: aarav.id, departmentId: deptOperations.id, purpose: "Infrastructure Review", startTime: past(14), endTime: new Date(past(14).getTime() + 2 * 3600_000), status: "COMPLETED" },
  ]});

  // ─── 7. Maintenance Requests ─────────────────────────────────────────────────
  console.log("  → Maintenance");

  await prisma.maintenanceRequest.createMany({ skipDuplicates: true, data: [
    { assetId: a["AST-LT-007"].id, requestedById: arjun.id, departmentId: deptEngineering.id, issueDescription: "Battery swells and overheating under load — needs replacement", status: "IN_PROGRESS", priority: "HIGH", approvedById: rohan.id, technicianId: musa.id, requestedAt: past(10), approvedAt: past(9), scheduledDate: past(7) },
    { assetId: a["AST-DH-003"].id, requestedById: aarav.id, departmentId: deptOperations.id, issueDescription: "UPS battery backup runtime dropped below 5 minutes", status: "TECHNICIAN_ASSIGNED", priority: "HIGH", approvedById: ananya.id, requestedAt: past(5), approvedAt: past(4), scheduledDate: future(1) },
    { assetId: a["AST-MR-003"].id, requestedById: priya.id, departmentId: deptFinance.id, issueDescription: "Projector lamp dim, colours washed out", status: "APPROVED", priority: "MEDIUM", approvedById: rohan.id, requestedAt: past(3), approvedAt: past(2) },
    { assetId: a["AST-NW-003"].id, requestedById: aditya.id, departmentId: deptEngineering.id, issueDescription: "Access point dropping connections intermittently on Floor 3", status: "PENDING", priority: "MEDIUM", requestedAt: past(1) },
    { assetId: a["AST-MN-002"].id, requestedById: arjun.id, departmentId: deptEngineering.id, issueDescription: "Monitor has dead pixel cluster in upper-left quadrant", status: "RESOLVED", priority: "LOW", approvedById: ananya.id, requestedAt: past(30), approvedAt: past(28), scheduledDate: past(25), resolvedAt: past(20), resolutionNotes: "Panel replaced under warranty. Asset returned to user." },
    { assetId: a["AST-PR-001"].id, requestedById: kavya.id, departmentId: deptProduct.id, issueDescription: "Some keys on MX Keys sticking after liquid spill", status: "PENDING", priority: "LOW", requestedAt: past(2) },
  ]});

  // ─── 8. Audit Cycles ─────────────────────────────────────────────────────────
  console.log("  → Audits");

  const audit1 = await prisma.auditCycle.create({ data: {
    title: "Q3 2025 IT Asset Audit",
    description: "Full audit of all IT equipment across Engineering and Operations",
    status: "IN_PROGRESS",
    startDate: past(14),
    createdById: musa.id,
    departmentId: deptEngineering.id,
  }});

  const audit2 = await prisma.auditCycle.create({ data: {
    title: "Finance Department Asset Verification",
    description: "Spot-check of Finance dept assets before fiscal year close",
    status: "SCHEDULED",
    startDate: future(7),
    createdById: musa.id,
    departmentId: deptFinance.id,
  }});

  await prisma.auditRecord.createMany({ data: [
    { auditCycleId: audit1.id, assetId: a["AST-LT-001"].id, status: "VERIFIED", notes: "Asset in excellent condition, serial verified", createdById: rohan.id },
    { auditCycleId: audit1.id, assetId: a["AST-LT-002"].id, status: "VERIFIED", notes: "Minor wear on casing, functioning normally", createdById: rohan.id },
    { auditCycleId: audit1.id, assetId: a["AST-LT-007"].id, status: "DAMAGED", notes: "Battery bulge confirmed — under maintenance", createdById: rohan.id },
    { auditCycleId: audit1.id, assetId: a["AST-MN-001"].id, status: "VERIFIED", notes: "Clean, no defects", createdById: ananya.id },
    { auditCycleId: audit1.id, assetId: a["AST-MN-002"].id, status: "VERIFIED", notes: "Panel replaced, verified post-repair", createdById: ananya.id },
    { auditCycleId: audit1.id, assetId: a["AST-PR-001"].id, status: "MISSING", notes: "Not found at assigned desk — user notified", createdById: rohan.id },
    { auditCycleId: audit1.id, assetId: a["AST-DH-001"].id, status: "VERIFIED", notes: "Mac Pro verified in DevLab", createdById: rohan.id },
    { auditCycleId: audit1.id, assetId: a["AST-NW-001"].id, status: "VERIFIED", notes: "Switch verified in server room", createdById: ananya.id },
  ]});

  // ─── 9. Notifications ────────────────────────────────────────────────────────
  console.log("  → Notifications");

  await prisma.notification.createMany({ skipDuplicates: true, data: [
    { userId: musa.id, title: "Overdue Asset Alert", message: "AST-LT-006 (HP EliteBook) assigned to Rahul Iyer is 30 days overdue for return.", type: "ALERT", priority: "HIGH", isRead: false },
    { userId: musa.id, title: "Maintenance Request — UPS", message: "Aarav Sharma raised a HIGH priority maintenance request for APC Smart-UPS 1500VA.", type: "ALERT", priority: "HIGH", isRead: false },
    { userId: musa.id, title: "Q3 Audit: 1 Missing Asset", message: "Logitech MX Keys S (AST-PR-001) reported missing during Q3 IT Asset Audit.", type: "ALERT", priority: "HIGH", isRead: false },
    { userId: musa.id, title: "Transfer Request Pending", message: "Priya Mehta requested transfer of HP EliteBook 840 to Finance Dept.", type: "INFO", priority: "MEDIUM", isRead: false },
    { userId: rohan.id, title: "New Maintenance Request", message: "Kavya Nair raised a maintenance request for Logitech MX Keys S (sticky keys).", type: "INFO", priority: "LOW", isRead: false },
    { userId: rohan.id, title: "Booking Confirmed", message: "Conf Room A display booked for Engineering All-Hands on " + future(2).toDateString(), type: "INFO", priority: "LOW", isRead: true },
    { userId: arjun.id, title: "Asset Allocated", message: "Dell UltraSharp Monitor (AST-MN-001) has been allocated to you.", type: "INFO", priority: "MEDIUM", isRead: true },
    { userId: arjun.id, title: "Maintenance Approved", message: "Your maintenance request for MacBook Air M2 has been approved and is In Progress.", type: "INFO", priority: "MEDIUM", isRead: false },
    { userId: muskan.id, title: "Transfer Request Received", message: "Dell UltraSharp U2723D (AST-MN-003) transfer request to Engineering is pending your approval.", type: "INFO", priority: "MEDIUM", isRead: false },
    { userId: aarav.id, title: "Technician Assigned", message: "A technician has been assigned to UPS maintenance request. Scheduled for tomorrow.", type: "INFO", priority: "HIGH", isRead: false },
    { userId: priya.id, title: "Audit Scheduled", message: "Finance Department Asset Verification audit has been scheduled starting " + future(7).toDateString(), type: "INFO", priority: "MEDIUM", isRead: false },
    { userId: kavya.id, title: "Overdue Return Notice", message: "iPad Air (AST-MB-003) on loan to Product dept is 7 days overdue. Please arrange return.", type: "ALERT", priority: "HIGH", isRead: false },
  ]});

  // ─── 10. Activity Log ────────────────────────────────────────────────────────
  console.log("  → Activity Logs");

  await prisma.activityLog.createMany({ data: [
    { actorId: musa.id, action: "USER_REGISTERED", module: "AUTH", entityType: "USER", entityId: musa.id, description: "Admin account created" },
    { actorId: musa.id, action: "ASSET_CREATED", module: "ASSETS", entityType: "ASSET", entityId: a["AST-LT-001"].id, description: "MacBook Pro M3 registered" },
    { actorId: rohan.id, action: "ASSET_ALLOCATED", module: "ALLOCATIONS", entityType: "ALLOCATION", entityId: a["AST-LT-001"].id, description: "MacBook Pro M3 allocated to Musa Qureshi" },
    { actorId: rohan.id, action: "ASSET_ALLOCATED", module: "ALLOCATIONS", entityType: "ALLOCATION", entityId: a["AST-LT-002"].id, description: "MacBook Pro M3 allocated to Arjun Gupta" },
    { actorId: arjun.id, action: "MAINTENANCE_REQUESTED", module: "MAINTENANCE", entityType: "MAINTENANCE", entityId: a["AST-LT-007"].id, description: "Maintenance raised for MacBook Air M2 — battery issue" },
    { actorId: rohan.id, action: "MAINTENANCE_APPROVED", module: "MAINTENANCE", entityType: "MAINTENANCE", entityId: a["AST-LT-007"].id, description: "Maintenance approved for MacBook Air M2" },
    { actorId: musa.id, action: "AUDIT_CREATED", module: "AUDITS", entityType: "AUDIT", entityId: audit1.id, description: "Q3 2025 IT Asset Audit cycle created" },
    { actorId: rohan.id, action: "AUDIT_RECORD_ADDED", module: "AUDITS", entityType: "AUDIT", entityId: audit1.id, description: "AST-PR-001 (MX Keys S) marked MISSING in audit" },
  ]});

  console.log("✅ Seed complete!");
  console.log("\n📋 Demo credentials (all share password: Admin@1234)");
  console.log("   ADMIN:         musaqureshi788code@gmail.com");
  console.log("   DEPT_HEAD:     kawadkarmuskan4@gmail.com");
  console.log("   ASSET_MANAGER: rohan.patel@company.dev");
  console.log("   EMPLOYEE:      arjun.gupta@company.dev");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
