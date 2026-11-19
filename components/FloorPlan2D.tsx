"use client";

import Image from "next/image";
import {
  BUILDING, SITE_IMAGE, STATUS_INFO, unitsOfFloor, type Unit, type FilterStatus
} from "@/data/berkley";

type Props = {
  floor: number;
  filter: FilterStatus;
  selectedUnitId: string | null;
  onSelectUnit: (unit: Unit) => void;
};

export default function FloorPlan2D({ floor, filter, selectedUnitId, onSelectUnit }: Props) {
  return (
    <div className="plan2d-scroller">
      <div className="plan2d-frame">
        <Image
          src={SITE_IMAGE.src}
          alt="Mặt bằng dự án THE BERKLEY từ ảnh tham khảo"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 960px"
          style={{ objectFit: "contain" }}
        />
        <svg
          className="plan2d-polygons"
          viewBox={`0 0 ${SITE_IMAGE.pixelWidth} ${SITE_IMAGE.pixelHeight}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Sơ đồ tương tác 5 căn của tầng ${floor}`}
        >
          {unitsOfFloor(floor).map((unit) => {
            const matches = filter === "all" || unit.status === filter;
            const selected = unit.id === selectedUnitId;
            const points = unit.polygon.map(([x, y]) => {
              const imageX = BUILDING.pixelRect.x + x * BUILDING.pixelRect.width - SITE_IMAGE.cropX;
              const imageY = BUILDING.pixelRect.y + y * BUILDING.pixelRect.height - SITE_IMAGE.cropY;
              return `${imageX},${imageY}`;
            }).join(" ");
            return (
              <polygon
                key={unit.id}
                points={points}
                fill={selected ? "#4a8af7" : STATUS_INFO[unit.status].color}
                fillOpacity={selected ? 0.78 : matches ? 0.56 : 0.09}
                stroke={selected ? "#ffffff" : matches ? "#ffffff" : "none"}
                strokeWidth={selected ? 4 : 1.7}
                className="plan-unit-polygon"
                tabIndex={0}
                role="button"
                aria-label={`Chọn căn ${unit.code}, ${STATUS_INFO[unit.status].label}`}
                onClick={() => onSelectUnit(unit)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectUnit(unit); }}
              />
            );
          })}
        </svg>
        <div className="plan2d-note">Mặt bằng gốc · 5 vùng căn được khoanh thử nghiệm</div>
      </div>
    </div>
  );
}
