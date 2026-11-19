'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, type ReactNode } from 'react';
import {
    ArrowDown,
    ArrowLeftRight,
    ArrowUp,
    Box,
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    Compass,
    Cuboid,
    Filter,
    Info,
    Layers,
    LayoutGrid,
    MapPinned,
    Maximize2,
    MousePointer2,
    RefreshCw,
    Ruler,
    X,
    ZoomIn,
} from 'lucide-react';
import {
    BUILDING,
    INVENTORY,
    STATUS_INFO,
    unitsOfFloor,
    type FilterStatus,
    type Unit,
    type ViewMode,
} from '@/data/berkley';
import { formatArea, formatVndBillions } from '@/lib/format';
import FloorPlan2D from './FloorPlan2D';

const BuildingScene = dynamic(() => import('./BuildingScene'), {
    ssr: false,
    loading: () => (
        <div className="scene-placeholder">
            <span className="spinner" /> Đang khởi tạo WebGL…
        </div>
    ),
});

const FILTERS: FilterStatus[] = ['all', 'available', 'sold', 'cross', 'exclusive'];

function IconButton({
    title,
    children,
    onClick,
    disabled,
}: {
    title: string;
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button title={title} aria-label={title} className="icon-button" onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}

function UnitDetails({ unit, onClose }: { unit: Unit; onClose: () => void }) {
    const meta = STATUS_INFO[unit.status];
    return (
        <aside className="unit-details" aria-label="Thông tin quỹ căn đã chọn">
            <div className="unit-details__head">
                <span className="unit-details__eyebrow">THÔNG TIN QUỸ CĂN</span>
                <button onClick={onClose} className="details-close" aria-label="Đóng thông tin">
                    <X size={17} />
                </button>
            </div>
            <div className="unit-details__code">Căn {unit.code}</div>
            <span className="status-chip" style={{ background: meta.pale, color: meta.color }}>
                <span style={{ background: meta.color }} /> {meta.label}
            </span>
            <div className="unit-details__grid">
                <div>
                    <small>Tòa nhà</small>
                    <strong>{BUILDING.name}</strong>
                </div>
                <div>
                    <small>Tầng</small>
                    <strong>{String(unit.floor).padStart(2, '0')}</strong>
                </div>
                <div>
                    <small>Loại căn</small>
                    <strong>{unit.bedroom}</strong>
                </div>
                <div>
                    <small>Diện tích</small>
                    <strong>{formatArea(unit.area)}</strong>
                </div>
            </div>
            <div className="unit-details__price">
                <span>Giá tham khảo (mock)</span>
                <strong>{formatVndBillions(unit.price)}</strong>
            </div>
            <p className="unit-details__disclaimer">
                Số liệu, tình trạng và giá trong demo đều là dữ liệu giả lập, không phải thông tin bán hàng chính thức.
            </p>
        </aside>
    );
}

export default function InventoryDashboard() {
    const [mode, setMode] = useState<ViewMode>('3d');
    const [floor, setFloor] = useState(9);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);
    const [showHelp, setShowHelp] = useState(false);

    const selectedUnit = useMemo(() => INVENTORY.find((unit) => unit.id === selectedUnitId) ?? null, [selectedUnitId]);
    const floorUnits = useMemo(() => unitsOfFloor(floor), [floor]);
    const visibleCount = floorUnits.filter((u) => filter === 'all' || u.status === filter).length;
    const availableCount = INVENTORY.filter((unit) => unit.status === 'available').length;

    const setFloorSafe = (next: number) => {
        if (next < 1 || next > BUILDING.floorCount) return;
        setFloor(next);
        setSelectedUnitId(null);
    };

    const selectUnit = (unit: Unit) => {
        setSelectedUnitId(unit.id);
    };

    const reset = () => {
        setFloor(9);
        setFilter('all');
        setSelectedUnitId(null);
        setResetKey((old) => old + 1);
    };

    const toggleFullscreen = () => {
        const element = document.getElementById('inventory-viewer');
        if (!element) return;
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else element.requestFullscreen?.().catch(() => {});
    };

    return (
        <div className="app-shell">
            <main className="main-content">
                <section className="page-header">
                    <h1>Mô phỏng 3D tòa nhà</h1>
                    <div className="header-actions">
                        <span className="input-label">CHẾ ĐỘ HIỂN THỊ</span>
                        <div className="mode-switch" role="group" aria-label="Chế độ xem">
                            <button onClick={() => setMode('2d')} className={mode === '2d' ? 'active' : ''}>
                                <LayoutGrid size={16} /> Mặt bằng 2D
                            </button>
                            <button onClick={() => setMode('3d')} className={mode === '3d' ? 'active' : ''}>
                                <Box size={16} /> Xem 3D
                            </button>
                        </div>
                    </div>
                </section>

                <section className="metric-row" aria-label="Thống kê demo">
                    <div className="metric-card">
                        <span className="metric-icon metric-icon--navy">
                            <Building2 size={19} />
                        </span>
                        <div>
                            <small>DỰ ÁN</small>
                            <strong>THE BERKLEY</strong>
                        </div>
                    </div>
                    <div className="metric-card">
                        <span className="metric-icon metric-icon--blue">
                            <Layers size={19} />
                        </span>
                        <div>
                            <small>TỔNG SỐ TẦNG</small>
                            <strong>{BUILDING.floorCount} tầng</strong>
                        </div>
                    </div>
                    <div className="metric-card">
                        <span className="metric-icon metric-icon--purple">
                            <Cuboid size={19} />
                        </span>
                        <div>
                            <small>CĂN HỘ MÔ PHỎNG</small>
                            <strong>{INVENTORY.length} căn</strong>
                        </div>
                    </div>
                    <div className="metric-card">
                        <span className="metric-icon metric-icon--green">
                            <MapPinned size={19} />
                        </span>
                        <div>
                            <small>CĂN CÒN HÀNG (MOCK)</small>
                            <strong>{availableCount} căn</strong>
                        </div>
                    </div>
                </section>

                <section className="viewer-panel" id="inventory-viewer">
                    <div className="viewer-toolbar">
                        <div className="viewer-toolbar__left">
                            <div className="viewer-title">
                                <span className="live-dot" />
                                <small>THE BERKLEY / TÒA A</small>
                            </div>
                        </div>
                        <div className="viewer-toolbar__right">
                            <div className="floor-stepper">
                                <button
                                    onClick={() => setFloorSafe(floor - 1)}
                                    disabled={floor === 1}
                                    aria-label="Tầng dưới"
                                >
                                    <ArrowDown size={15} />
                                </button>
                                <select
                                    aria-label="Chọn tầng"
                                    value={floor}
                                    onChange={(e) => setFloorSafe(Number(e.target.value))}
                                >
                                    {Array.from({ length: BUILDING.floorCount }, (_, idx) => idx + 1).map((value) => (
                                        <option value={value} key={value}>
                                            Tầng {String(value).padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setFloorSafe(floor + 1)}
                                    disabled={floor === BUILDING.floorCount}
                                    aria-label="Tầng trên"
                                >
                                    <ArrowUp size={15} />
                                </button>
                            </div>
                            <IconButton title="Đặt lại góc nhìn" onClick={reset}>
                                <RefreshCw size={17} />
                            </IconButton>
                            <IconButton title="Toàn màn hình" onClick={toggleFullscreen}>
                                <Maximize2 size={17} />
                            </IconButton>
                        </div>
                    </div>

                    <div className="filter-bar">
                        <div className="filter-pills">
                            {FILTERS.map((value) => {
                                const active = filter === value;
                                return (
                                    <button
                                        key={value}
                                        className={`filter-pill ${active ? 'filter-pill--active' : ''}`}
                                        onClick={() => setFilter(value)}
                                        aria-pressed={active}
                                    >
                                        {value === 'all' ? (
                                            <span className="all-dot">
                                                <span />
                                                <span />
                                                <span />
                                            </span>
                                        ) : (
                                            <i style={{ background: STATUS_INFO[value].color }} />
                                        )}
                                        {value === 'all' ? 'Tất cả' : STATUS_INFO[value].label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="filter-counter">
                            {visibleCount}/5 căn tại tầng {String(floor).padStart(2, '0')}
                        </div>
                    </div>

                    <div className={`viewer-canvas ${mode === '2d' ? 'viewer-canvas--2d' : ''}`}>
                        {mode === '3d' ? (
                            <BuildingScene
                                floor={floor}
                                filter={filter}
                                selectedUnitId={selectedUnitId}
                                onSelectUnit={selectUnit}
                                resetKey={resetKey}
                            />
                        ) : (
                            <FloorPlan2D
                                floor={floor}
                                filter={filter}
                                selectedUnitId={selectedUnitId}
                                onSelectUnit={selectUnit}
                            />
                        )}
                        <div className="viewer-floating viewer-floating--top">
                            <span className="orbit-icon">
                                <Compass size={16} />
                            </span>
                            <b>{mode === '3d' ? 'GÓC NHÌN 3D' : 'MẶT BẰNG 2D'}</b>
                            <span className="viewer-floating__divider" />
                            Tầng {String(floor).padStart(2, '0')}
                        </div>
                        {mode === '3d' && (
                            <div className="viewer-floating viewer-floating--left">
                                <MousePointer2 size={17} /> <span>Kéo để xoay · Cuộn để zoom · Nhấn căn để xem</span>
                            </div>
                        )}
                        <div className="viewer-floating viewer-floating--bottom">
                            <span className="legend-dot" style={{ background: STATUS_INFO.available.color }} /> Còn hàng
                            <span className="legend-dot" style={{ background: STATUS_INFO.sold.color }} /> Không có hàng
                            <span className="legend-dot" style={{ background: STATUS_INFO.cross.color }} /> Quỹ chéo
                            <span className="legend-dot" style={{ background: STATUS_INFO.exclusive.color }} /> Độc
                            quyền
                        </div>
                        {selectedUnit && <UnitDetails unit={selectedUnit} onClose={() => setSelectedUnitId(null)} />}
                        <button
                            className="help-fab"
                            onClick={() => setShowHelp((prev) => !prev)}
                            aria-label="Hướng dẫn"
                            title="Hướng dẫn"
                        >
                            <CircleHelp size={19} />
                        </button>
                        {showHelp && (
                            <div className="help-popover">
                                <strong>Hướng dẫn sử dụng</strong>
                                <p>
                                    Chọn tầng để cắt mô hình tại tầng đó. Kéo chuột để xoay, cuộn để phóng to. Click vào
                                    căn để mở thông tin. Có thể chuyển 2D / 3D và lọc theo tình trạng.
                                </p>
                                <button onClick={() => setShowHelp(false)}>Đã hiểu</button>
                            </div>
                        )}
                    </div>

                    <footer className="viewer-footer">
                        <span className="viewer-footer__right">Next.js + React Three Fiber</span>
                    </footer>
                </section>
            </main>
        </div>
    );
}
