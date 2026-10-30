# UniGoh — Boshqaruv paneli

Arizalar, talabalar va hamkor universitetlar bilan komissiya hisob-kitobi.

- Asosiy sayt bilan **bir xil Supabase** loyihasidan foydalanadi.
- Login: Supabase Auth. Parollar kodda saqlanmaydi.
- Rollar bazadagi `staff` jadvalida: `master` (hammasi) va `university_admin` (faqat o'z universiteti).
- Kirish huquqlari RLS bilan bazada nazorat qilinadi — sxema: `komilovv77/unigoh` → `supabase/migrations/`.

## Sozlash

Vercel → Settings → Environment Variables (Production va Preview):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
