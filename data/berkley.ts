/**
 * DEMO DATA: 5 polygon tương ứng căn 01..05, vẽ gần đúng theo ảnh 2D do người dùng cung cấp.
 * KHÔNG phải dữ liệu đo đạc/định vị chính thức của dự án.
 *
 * Tọa độ polygon là pixel của ảnh toàn cảnh gốc 1529x910 rồi chuẩn hóa
 * theo bounding box ảnh mặt bằng tầng (x=785..1124; y=460..755).
 */
export type InventoryStatus = 'available' | 'sold' | 'cross' | 'exclusive';
export type FilterStatus = 'all' | InventoryStatus;
export type ViewMode = '2d' | '3d';
export type Point = [number, number];

export type UnitTemplate = {
    suffix: string;
    bedroom: string;
    area: number;
    polygon: Point[];
};

export type Unit = UnitTemplate & {
    id: string;
    floor: number;
    code: string;
    status: InventoryStatus;
    price: number;
};

export const SITE_IMAGE = {
    src: '/images/berkley-siteplan.jpg',
    pixelWidth: 962,
    pixelHeight: 800,
    /** Ảnh crop gốc bắt đầu tại x=278, y=81. */
    cropX: 278,
    cropY: 81,
    worldWidth: 32,
    worldDepth: (800 / 962) * 32,
} as const;

export const BUILDING = {
    name: 'THE BERKLEY',
    floorCount: 20,
    floorHeight: 0.9,
    /** Hình tầng crop x=785..1124, y=460..755, cùng hệ tọa độ với SITE_IMAGE. */
    pixelRect: { x: 785, y: 460, width: 339, height: 295 },
    floorPlanSrc: '/images/berkley-floorplan-masked.png',
};

const p = (x: number, y: number): Point => [
    (x - BUILDING.pixelRect.x) / BUILDING.pixelRect.width,
    (y - BUILDING.pixelRect.y) / BUILDING.pixelRect.height,
];

/** Các đường bao được đánh dấu thủ công theo ảnh tham khảo. */
/** Đường bao gần đúng của thân tòa chữ L trên mặt bằng, chuẩn hóa cùng pixelRect. */
export const BUILDING_FOOTPRINT: Point[] = [
    p(966, 460),
    p(1121, 460),
    p(1123, 754),
    p(785, 754),
    p(785, 578),
    p(890, 578),
    p(890, 548),
    p(966, 548),
];

export const UNIT_TEMPLATES: UnitTemplate[] = [
    {
        suffix: '01',
        bedroom: '2PN',
        area: 76.8,
        polygon: [p(977, 466), p(1118, 466), p(1118, 541), p(1098, 564), p(1005, 564), p(977, 544)],
    },
    {
        suffix: '02',
        bedroom: '3PN+1',
        area: 106.3,
        polygon: [p(1035, 567), p(1118, 567), p(1119, 750), p(1045, 750), p(1044, 673), p(1035, 650)],
    },
    {
        suffix: '03',
        bedroom: '2PN',
        area: 81.2,
        polygon: [p(934, 674), p(1041, 674), p(1042, 750), p(933, 750)],
    },
    {
        suffix: '04',
        bedroom: '2PN',
        area: 82.5,
        polygon: [p(789, 675), p(931, 675), p(930, 750), p(789, 750)],
    },
    {
        suffix: '05',
        bedroom: '2PN',
        area: 79.6,
        polygon: [p(792, 580), p(892, 580), p(893, 650), p(929, 650), p(930, 671), p(789, 671)],
    },
];

export const STATUS_INFO: Record<InventoryStatus, { label: string; color: string; pale: string }> = {
    available: { label: 'Còn hàng', color: '#30c893', pale: '#d8f8eb' },
    sold: { label: 'Không có hàng', color: '#ed5a62', pale: '#ffe7e8' },
    cross: { label: 'Quỹ chéo', color: '#ffa547', pale: '#fff0dc' },
    exclusive: { label: 'Quỹ độc quyền', color: '#8156e8', pale: '#eee8ff' },
};

const inventoryStatus = (floor: number, unitIndex: number): InventoryStatus => {
    const options: InventoryStatus[] = ['available', 'sold', 'cross', 'exclusive', 'available'];
    return options[(floor + unitIndex) % options.length];
};

export const INVENTORY: Unit[] = Array.from({ length: BUILDING.floorCount }, (_, index) => {
    const floor = index + 1;
    return UNIT_TEMPLATES.map(
        (template, unitIndex): Unit => ({
            ...template,
            id: `${floor}-${template.suffix}`,
            code: `${String(floor).padStart(2, '0')}${template.suffix}`,
            floor,
            status: inventoryStatus(floor, unitIndex),
            price: Math.round((template.area * (65 + floor * 1.25 + unitIndex * 1.5)) / 100) / 10,
        })
    );
}).flat();

export function unitsOfFloor(floor: number) {
    return INVENTORY.filter((unit) => unit.floor === floor);
}

/** pixel 2D toàn cảnh -> world X/Z trong Three.js (nhìn từ trên xuống). */
export function buildingWorld() {
    const { pixelRect } = BUILDING;
    const scale = SITE_IMAGE.worldWidth / SITE_IMAGE.pixelWidth;
    const centerImageX = pixelRect.x + pixelRect.width / 2 - SITE_IMAGE.cropX;
    const centerImageY = pixelRect.y + pixelRect.height / 2 - SITE_IMAGE.cropY;
    return {
        x: (centerImageX - SITE_IMAGE.pixelWidth / 2) * scale,
        z: (centerImageY - SITE_IMAGE.pixelHeight / 2) * scale,
        width: pixelRect.width * scale,
        depth: pixelRect.height * scale,
    };
}

export function centroid(points: Point[]): Point {
    return points.reduce<Point>(
        (acc, point) => [acc[0] + point[0] / points.length, acc[1] + point[1] / points.length],
        [0, 0]
    );
}
