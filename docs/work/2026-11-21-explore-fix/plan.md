# Fix: Explore (จาก screenshot บน iPhone)
- การ์ด Following ล้นขวา 30px: `.ex-feed` เป็น `<div>` content-box + width:100% + padding → `.ex-card{box-sizing:border-box}`
- tag ในการ์ดแผนสูง 44px (touch floor ไปโดน `<span class=chip>` ที่กดไม่ได้) → `.ex-tags .chip{min-height:0}`
