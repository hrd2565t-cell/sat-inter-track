const CACHE_NAME = 'sat-tracking-v2';

self.addEventListener('install', (e) => {
    self.skipWaiting(); // บังคับให้ Service Worker ตัวใหม่ทำงานทันทีไม่ต้องรอ
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './manifest.json',
                './icon.svg'
            ]);
        })
    );
});

// เคลียร์ไฟล์แคชเวอร์ชันเก่าทิ้ง (สำคัญมากสำหรับการอัปเดตแอปที่ผู้ใช้โหลดไปแล้ว)
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    // ปล่อยผ่านการเชื่อมต่อฐานข้อมูล Google เสมอ ไม่ให้ติดแคช
    if (e.request.url.includes('script.google') || e.request.url.includes('googleusercontent')) {
        return; 
    }

    e.respondWith(
        // Network-First Strategy: พยายามดึงจากเน็ตก่อน ถ้าเน็ตหลุดถึงค่อยเอาจาก Cache
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
