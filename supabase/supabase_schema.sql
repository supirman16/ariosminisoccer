-- Skema Database SQL untuk Minisoccer Arios
-- Ekspor ini dapat diunggah ke editor SQL Supabase pada proyek baru Anda.

-- 1. Tabel Tier Membership
CREATE TABLE membership_tiers (
    id SERIAL PRIMARY KEY,
    tier_name VARCHAR(50) NOT NULL,
    benefits_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Masukkan data standar Tier Membership
INSERT INTO membership_tiers (tier_name, benefits_json) VALUES
('Bronze', '{"discount_percentage": 5}'),
('Silver', '{"discount_percentage": 10}'),
('Gold', '{"discount_percentage": 15}');

-- 2. Tabel Profil Pengguna (Tersinkronisasi dengan auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama_lengkap VARCHAR(255) NOT NULL,
    nomor_telepon VARCHAR(20) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    points INT DEFAULT 0,
    membership_tier_id INT REFERENCES membership_tiers(id) ON DELETE SET NULL,
    membership_expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger untuk membuat profil secara otomatis saat user mendaftar di auth.users (opsional)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, nama_lengkap, nomor_telepon, role)
--   VALUES (new.id, '', '', 'customer');
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tabel Paket
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    nama_paket VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    harga DECIMAL(12,2) NOT NULL,
    jumlah_jam INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO packages (nama_paket, deskripsi, harga, jumlah_jam) VALUES
('Paket Hemat Siang', 'Paket bermain 5 jam untuk waktu siang hari (07:00 - 17:59). Berlaku selama 30 hari.', 2700000.00, 5),
('Paket Premium Malam', 'Paket bermain 5 jam bebas jam berapa saja termasuk malam hari. Berlaku selama 30 hari.', 3600000.00, 5);

-- 4. Tabel Pembelian Paket Pengguna
CREATE TABLE user_packages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    package_id INT REFERENCES packages(id) ON DELETE CASCADE,
    remaining_hours INT NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Versi Pengaturan Sistem
CREATE TABLE setting_versions (
    id SERIAL PRIMARY KEY,
    version_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO setting_versions (version_name, is_active) VALUES
('Pengaturan Standar Arios', TRUE);

-- 6. Tabel Detail Harga Pengaturan
CREATE TABLE settings_prices (
    id SERIAL PRIMARY KEY,
    version_id INT REFERENCES setting_versions(id) ON DELETE CASCADE,
    price_weekday INT NOT NULL DEFAULT 600000,
    price_weekend_night INT NOT NULL DEFAULT 800000,
    price_photographer INT NOT NULL DEFAULT 250000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO settings_prices (version_id, price_weekday, price_weekend_night, price_photographer) VALUES
(1, 600000, 800000, 250000);

-- 7. Tabel Detail Loyalty/Poin Pengaturan
CREATE TABLE settings_loyalty (
    id SERIAL PRIMARY KEY,
    version_id INT REFERENCES setting_versions(id) ON DELETE CASCADE,
    loyalty_system_enabled BOOLEAN DEFAULT TRUE,
    points_per_booking INT NOT NULL DEFAULT 10,
    redeem_points_needed INT NOT NULL DEFAULT 100,
    redeem_discount_amount INT NOT NULL DEFAULT 50000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO settings_loyalty (version_id, loyalty_system_enabled, points_per_booking, redeem_points_needed, redeem_discount_amount) VALUES
(1, TRUE, 10, 100, 50000);

-- 8. Tabel Detail Jam Operasional Pengaturan
CREATE TABLE settings_operational (
    id SERIAL PRIMARY KEY,
    version_id INT REFERENCES setting_versions(id) ON DELETE CASCADE,
    opening_hour VARCHAR(5) NOT NULL DEFAULT '07',
    closing_hour VARCHAR(5) NOT NULL DEFAULT '23',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO settings_operational (version_id, opening_hour, closing_hour) VALUES
(1, '07', '23');

-- 9. Tabel Booking Lapangan
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    nama_pemesan VARCHAR(255) NOT NULL,
    nomor_telepon VARCHAR(50) NOT NULL,
    tanggal_booking DATE NOT NULL,
    jam_mulai VARCHAR(5) NOT NULL,
    durasi INT NOT NULL DEFAULT 1,
    status_pembayaran VARCHAR(20) DEFAULT 'pending' CHECK (status_pembayaran IN ('pending', 'confirmed', 'cancelled')),
    pending_until TIMESTAMP WITH TIME ZONE,
    points_redeemed INT DEFAULT 0,
    discount_applied DECIMAL(12,2) DEFAULT 0.00,
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    waktu_pemesanan TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabel Slot yang Diblokir (Oleh Admin)
CREATE TABLE blocked_slots (
    id SERIAL PRIMARY KEY,
    block_date DATE NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Tabel Galeri Foto & Video
CREATE TABLE gallery (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('photo', 'video')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Awal Galeri
INSERT INTO gallery (type, title, description, url) VALUES
('photo', 'Sudut Lapangan Utama', 'Tampilan dekat rumput sintetis standar FIFA kami di area tengah.', '/Galeri 1.png'),
('photo', 'Aksi Pertandingan Malam', 'Keseruan kompetisi di bawah lampu penerangan malam hari LED Arios.', '/Galeri 2.png'),
('photo', 'Loker & Ruang Ganti', 'Fasilitas loker penyimpanan yang aman dan ruang mandi air panas.', '/Galeri 3.png'),
('photo', 'Lobi Penyambutan', 'Pintu masuk utama dan lobi resepsionis yang ramah.', '/Galeri 4.png'),
('video', 'Cuplikan Lapangan Malam', 'Tampilan visual malam hari dengan penerangan optimal.', 'https://player.vimeo.com/external/435674703.sd.mp4?s=7f5a1cf3673c68b6b19a16f2c3d5e27a9b0c9502&profile_id=165&oauth2_token_id=57447761'),
('video', 'Gol Indah Turnamen', 'Kumpulan gol-gol terbaik yang tercatat di turnamen bulan ini.', 'https://player.vimeo.com/external/459389137.sd.mp4?s=91ae05cb19e248b1ff25418b76a6cf4ec2cb961a&profile_id=139&oauth2_token_id=57447761');

-- 12. Tambah Kolom Blacklist ke Tabel Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blacklisted BOOLEAN DEFAULT FALSE;

-- 13. Tabel Registrasi Turnamen
CREATE TABLE tournament_registrations (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    manager_name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tournament_id INT NOT NULL,
    players_count INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Tabel Konfigurasi Konten Website (CMS)
CREATE TABLE website_config (
    id INT PRIMARY KEY DEFAULT 1,
    whatsapp_link VARCHAR(255),
    instagram_link VARCHAR(255),
    tiktok_link VARCHAR(255),
    maps_link TEXT,
    promo_happy_hour_title VARCHAR(255) DEFAULT 'Happy Hour Siang',
    promo_happy_hour TEXT,
    promo_photographer_title VARCHAR(255) DEFAULT 'Promo Weekend Photographer',
    promo_photographer TEXT,
    promo_membership_title VARCHAR(255) DEFAULT 'Membership Gold Booster',
    promo_membership TEXT,
    faq_json JSONB,
    promos_json JSONB,
    facilities_json JSONB DEFAULT '[]'::jsonb,
    location_image TEXT,
    location_images_json JSONB DEFAULT '[]'::jsonb,
    price_config_json JSONB DEFAULT '{"base_price_day": 600000, "base_price_night": 800000, "night_hour_start": 18, "special_rules": [{"id": "weekend", "name": "Surcharge Akhir Pekan (Sabtu-Minggu)", "surcharge": 100000}], "addon_facilities": [{"id": "photographer", "name": "Jasa Fotografer Profesional", "price": 250000}]}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Awal Website Settings
INSERT INTO website_config (id, whatsapp_link, instagram_link, tiktok_link, maps_link, promo_happy_hour_title, promo_happy_hour, promo_photographer_title, promo_photographer, promo_membership_title, promo_membership, faq_json, promos_json, facilities_json, location_image, location_images_json, price_config_json) 
VALUES (
    1,
    'https://wa.me/6281234567890',
    'https://instagram.com/ariosminisoccer',
    'https://tiktok.com/@ariosminisoccer',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.833552884825!2d106.7961858153439!3d-6.2864351954508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1e6378a6321%3A0x8f5f6d3a365a431!2sF7%20Mini%20Soccer!5e0!3m2!1sen!2sid!4v1662815131541!5m2!1sen!2sid',
    'Happy Hour Siang',
    'Diskon 25% untuk sewa lapangan di jam siang hari (Senin - Jumat, 10.00 - 15.00).',
    'Promo Weekend Photographer',
    'Sewa lapangan minimal 2 jam gratis jasa fotografer profesional selama 1 jam.',
    'Membership Gold Booster',
    'Dapatkan poin ganda untuk member Gold yang memesan slot malam.',
    '[{"q": "Bagaimana cara melakukan reschedule?", "a": "Untuk melakukan reschedule, silakan hubungi admin kami melalui WhatsApp minimal 6 jam sebelum jadwal bermain Anda."}, {"q": "Apakah tersedia fasilitas parkir?", "a": "Ya, kami memiliki area parkir yang luas dan aman untuk mobil dan motor, gratis untuk semua pelanggan kami."}]'::jsonb,
    '[{"badge": "HAPPY HOUR", "title": "Happy Hour Siang", "description": "Diskon 15% untuk bermain pada hari Senin - Jumat pukul 07.00 - 15.00. Main hemat dengan performa maksimal."}, {"badge": "GRATIS FOTO", "title": "Promo Weekend Photographer", "description": "Sewa lapangan minimal 2 jam di akhir pekan (Sabtu & Minggu), gratis jasa fotografer profesional selama 1 jam pertama."}, {"badge": "BONUS POIN", "title": "Membership Gold Booster", "description": "Daftar atau upgrade ke akun Member Gold bulan ini dan dapatkan bonus 50 poin langsung tanpa minimum transaksi."}]'::jsonb,
    '[{"id": 1, "title": "Rumput Sintetis FIFA", "description": "Bermain lebih aman dan presisi di atas rumput sintetis standar kelas dunia FIFA.", "photos": ["/Galeri 1.png"]}, {"id": 2, "title": "Tribun Penonton", "description": "Tribun yang luas dan bersih untuk kenyamanan penonton dan suporter tim Anda.", "photos": ["/Galeri 4.png"]}, {"id": 3, "title": "Lampu LED Terang", "description": "Penerangan malam hari merata berkekuatan tinggi, bermain malam serasa siang hari.", "photos": ["/Galeri 2.png"]}]'::jsonb,
    NULL,
    '[]'::jsonb,
    '{"base_price_day": 600000, "base_price_night": 800000, "night_hour_start": 18, "special_rules": [{"id": "weekend", "name": "Surcharge Akhir Pekan (Sabtu-Minggu)", "surcharge": 100000}], "addon_facilities": [{"id": "photographer", "name": "Jasa Fotografer Profesional", "price": 250000}]}'::jsonb
);


