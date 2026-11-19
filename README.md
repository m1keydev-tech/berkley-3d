# THE BERKLEY · Quỹ căn 3D từ mặt bằng 2D

Bản demo Next.js + React Three Fiber: dùng đúng ảnh mặt bằng bạn gửi làm nền 2D, dựng mô hình 3D 20 tầng bằng code (không cần Blender/GLB), vẽ 5 vùng căn hộ trên mặt bằng bằng polygon, mô phỏng trạng thái và chi tiết căn hộ.

> ⚠️ Đây là **bản mô phỏng**. Hình học, đường bao 5 căn được vẽ thủ công gần đúng từ screenshot; không phải tự động suy ra kiến trúc chính xác từ ảnh. Số tầng, diện tích, giá và trạng thái là **mock data**. Phần mặt dựng kính/các tầng là đồ họa dựng bằng code, không phản ánh chính xác kiến trúc của dự án.

## Yêu cầu
- Node.js >= 20.9 (khuyên dùng Node 22)
- npm
- Trình duyệt Chrome/Edge/Safari hỗ trợ WebGL2

## Chạy thử

```bash
npm install
npm run dev
```

Mở: http://localhost:3000

Có thể chạy ở cổng khác: `npm run dev -- -p 3001`.

## Các chức năng

- Chuyển 2D / 3D.
- Cắt mô hình ở tầng đang chọn (tầng 1–20), xem trực diện mặt bằng trên nóc tòa.
- Orbit chuột, zoom, thay đổi góc nhìn, toàn màn hình và đặt lại view.
- Chọn 5 vùng căn 01–05, hiện modal/panel chi tiết.
- Lọc trạng thái căn (còn hàng, không có hàng, quỹ chéo, độc quyền).
- 100 căn mẫu được sinh từ 20 tầng × 5 căn.
- Đồng bộ chọn tầng/căn giữa 2D và 3D.

## Cấu trúc

```
app/
  globals.css             Giao diện + responsive
  layout.tsx              Layout Next.js
  page.tsx                Entry page
components/
  InventoryDashboard.tsx  Toolbar, filters, stats, details
  BuildingScene.tsx       Three.js: site plan, facade, floors, polygons
  FloorPlan2D.tsx         Mặt bằng ảnh + SVG polygon có thể click
data/
  berkley.ts              Tọa độ, footprint, 5 căn mẫu, mock inventory
lib/
  format.ts               Helper định dạng
public/images/
  berkley-siteplan.jpg    Ảnh crop toàn cảnh từ screenshot bạn cung cấp
  berkley-floorplan.jpg   Ảnh crop tầng mẫu từ screenshot bạn cung cấp
```

## Thay bằng dữ liệu thật

1. **Thay ảnh**: thay `public/images/berkley-siteplan.jpg`, `berkley-floorplan.jpg` bằng ảnh mặt bằng của dự án của bạn, đúng tỷ lệ và vùng crop.
2. **Đường bao các căn**: trong `data/berkley.ts`, sửa mảng `UNIT_TEMPLATES` chứa polygon (tọa độ đang chuẩn hóa trên ảnh mặt bằng). Vùng polygon được vẽ thủ công để demo; production nên có một công cụ trong CMS cho admin vẽ trực tiếp trên ảnh.
3. **Tòa nhà**: sửa `BUILDING.pixelRect` theo vị trí khối nhà trên ảnh siteplan; sửa `floorCount`, `floorHeight`.
4. **Dữ liệu**: thay mảng `INVENTORY` bằng response API, khớp `inventory_id`, `floor_id`, `unit_id`, status, area, price. Đừng tin trạng thái từ frontend; phải kiểm soát visibility/quyền từ backend.
5. **Mặt dựng**: các ô kính 3D và màu mặt đứng đang là đại diện giả lập, chưa tương ứng chính xác từng căn. Để mapping vị trí façade chuẩn, cần thêm bản vẽ mặt đứng, mặt cắt hoặc model BIM/3D.

## Giới hạn hiện tại

- Ảnh nền chứa sẵn màu/chữ/điểm đánh dấu của screenshot tham khảo.
- Demo chưa đọc được polygon tự động từ ảnh, mà dùng 5 polygon vẽ thủ công.
- Nếu có nhiều loại mặt bằng khác nhau theo từng tầng, cần bổ sung floor plan + polygon riêng cho từng loại tầng.
- Tầng 3D được dựng từ khối thẳng đứng có footprint hình hộp, chưa chính xác phần lõm kiến trúc.
- Số căn và trạng thái là mock để test chức năng, chưa có backend thật.

## Liên kết công nghệ
- https://nextjs.org/docs
- https://r3f.docs.pmnd.rs/
- https://drei.docs.pmnd.rs/
