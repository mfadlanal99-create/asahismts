import type { TutorialStep } from '../../types/tutorial';

export const TUTORIALS_PART_4: Record<string, TutorialStep[]> = {
  'rigging-lifting': [
    {
      id: 'rigging-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'ASME B30.9 Rigging & Hoisting Safety',
        id: 'Keselamatan Rigging & Pengangkatan ASME B30.9',
        ja: 'ASME B30.9 çŽ‰æŽ›ã‘ãƒ»æšé‡å®‰å…¨ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ã‚¿',
      },
      description: {
        en: 'Welcome! This lab models two-leg sling geometry, hitch efficiency, Center-of-Gravity (CoG) alignment, and load tilt on lift-off. Letâ€™s walk through every control and safety diagnostic.',
        id: 'Selamat datang! Laboratorium ini memodelkan geometri sling dua kaki, efisiensi ikatan (hitch), kesejajaran Pusat Gravitasi (CoG), dan kemiringan beban saat terangkat. Mari telusuri setiap kontrol dan diagnostik keselamatannya.',
        ja: 'ã‚ˆã†ã“ãï¼2æœ¬åŠã‚Šã‚¹ãƒªãƒ³ã‚°ã®å¹¾ä½•å­¦ã€ãƒ’ãƒƒãƒåŠ¹çŽ‡ã€é‡å¿ƒï¼ˆCoGï¼‰èŠ¯å‡ºã—ã€åœ°åˆ‡ã‚Šæ™‚ã®å‚¾ãã‚’è§£æžã—ã¾ã™ã€‚å„æ©Ÿèƒ½ã¨å®‰å…¨è¨ºæ–­ã‚’é †ç•ªã«ç¢ºèªã—ã¾ã—ã‚‡ã†ã€‚',
      },
      tip: {
        en: 'Keep horizontal sling angles at 60Â° or steeper whenever headroom allows to minimize leg tension and horizontal pinch.',
        id: 'Pertahankan sudut sling horizontal â‰¥ 60Â° apabila ruang bebas vertikal mencukupi untuk meminimalkan tegangan kaki sling dan gaya jepit horizontal.',
        ja: 'æšç¨‹ã«ä½™è£•ãŒã‚ã‚‹é™ã‚Šã€å¯¾æ°´å¹³ã‚¹ãƒªãƒ³ã‚°è§’åº¦ã‚’ 60Â° ä»¥ä¸Šã«ä¿ã¡ã€è„šå¼µåŠ›ã¨æ°´å¹³åœ§ç¸®åŠ›ã‚’æŠ‘ãˆã¾ã—ã‚‡ã†ã€‚',
      },
    },
    {
      id: 'rigging-presets',
      badge: { en: 'Feature 1 Â· Presets', id: 'Fitur 1 Â· Preset', ja: 'æ©Ÿèƒ½1 Â· ãƒ—ãƒªã‚»ãƒƒãƒˆ' },
      title: {
        en: 'Equipment Hoisting Presets',
        id: 'Preset Peralatan Angkat',
        ja: 'æ©Ÿå™¨æšé‡ãƒ—ãƒªã‚»ãƒƒãƒˆ',
      },
      description: {
        en: 'Pick one of the four Equipment Hoisting Presets (showing mass in tonnes, default Î¸, and CoG offset) to load realistic industrial liftsâ€”such as symmetric pumps or offset-CoG compressors.',
        id: 'Pilih salah satu dari empat Preset Peralatan Angkat (menampilkan massa dalam ton, sudut Î¸ bawaan, dan pergeseran CoG) untuk memuat skenario pengangkatan industri nyataâ€”seperti pompa simetris atau kompresor dengan CoG tidak simetris.',
        ja: '4ã¤ã®æ©Ÿå™¨æšé‡ãƒ—ãƒªã‚»ãƒƒãƒˆï¼ˆè³ªé‡ tãƒ»åˆæœŸè§’åº¦ Î¸ãƒ»CoGåå¿ƒã‚’è¡¨ç¤ºï¼‰ã‹ã‚‰ã€å¯¾ç§°ãƒãƒ³ãƒ—ã‚„åå¿ƒã‚³ãƒ³ãƒ—ãƒ¬ãƒƒã‚µãªã©ã®å®Ÿæ©Ÿã‚·ãƒŠãƒªã‚ªã‚’é¸æŠžã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="rigging-presets"]',
    },
    {
      id: 'rigging-angle',
      badge: { en: 'Feature 2 Â· Sling Angle', id: 'Fitur 2 Â· Sudut Sling', ja: 'æ©Ÿèƒ½2 Â· ã‚¹ãƒªãƒ³ã‚°è§’åº¦' },
      title: {
        en: 'Horizontal Sling Angle Î¸ & Spreader Beam',
        id: 'Sudut Sling Horizontal Î¸ & Spreader Beam',
        ja: 'å¯¾æ°´å¹³ã‚¹ãƒªãƒ³ã‚°è§’åº¦ Î¸ ã¨å¤©ç§¤ãƒ“ãƒ¼ãƒ ',
      },
      description: {
        en: 'Adjust Horizontal Sling Angle Î¸ (25Â°â€“75Â°) with the slider or quick-jump buttons (25Â°, 30Â°, 45Â°, 60Â°, 75Â°). Click "+ Spreader Beam" to keep sling legs vertical (90Â°) and eliminate horizontal pinch.',
        id: 'Atur Sudut Sling Horizontal Î¸ (25Â°â€“75Â°) melalui penggeser atau tombol cepat (25Â°, 30Â°, 45Â°, 60Â°, 75Â°). Klik "+ Spreader Beam" untuk menjaga kaki sling tetap vertikal (90Â°) dan menghilangkan gaya jepit horizontal.',
        ja: 'ã‚¹ãƒ©ã‚¤ãƒ€ãƒ¼ã¾ãŸã¯ã‚¯ã‚¤ãƒƒã‚¯ãƒœã‚¿ãƒ³ï¼ˆ25Â°/30Â°/45Â°/60Â°/75Â°ï¼‰ã§è§’åº¦ Î¸ ã‚’å¤‰æ›´ã—ã¾ã™ã€‚ã€Œ+ å¤©ç§¤ãƒ“ãƒ¼ãƒ æ¯”è¼ƒã€ã‚’æŠ¼ã™ã¨åŠã‚Šè„šãŒåž‚ç›´ï¼ˆ90Â°ï¼‰ã«ãªã‚Šæ°´å¹³åœ§ç¸®åŠ›ãŒã‚¼ãƒ­ã«ãªã‚Šã¾ã™ã€‚',
      },
      tip: {
        en: 'At Î¸ = 30Â°, leg tension doubles (2.000Ã—) compared to a vertical lift.',
        id: 'Pada Î¸ = 30Â°, tegangan kaki sling berlipat dua (2,000Ã—) dibandingkan pengangkatan vertikal.',
        ja: 'Î¸ = 30Â° ã§ã¯åž‚ç›´åŠã‚Šã®2å€ï¼ˆ2.000Ã—ï¼‰ã®å¼µåŠ›ãŒå„è„šã«ä½œç”¨ã—ã¾ã™ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'When should I use a spreader beam?',
            id: 'Kapan spreader beam perlu digunakan?',
            ja: 'å¤©ç§¤ãƒ“ãƒ¼ãƒ ï¼ˆã‚¹ãƒ—ãƒ¬ãƒƒãƒ€ãƒ¼ãƒ“ãƒ¼ãƒ ï¼‰ã¯ã„ã¤ä½¿ã„ã¾ã™ã‹ï¼Ÿ',
          },
          a: {
            en: 'Use a spreader beam when headroom is limited, when Î¸ drops below 45Â°, or when lifting thin-walled equipment that cannot resist horizontal pinch compression.',
            id: 'Gunakan spreader beam saat ruang bebas atas terbatas, sudut Î¸ turun di bawah 45Â°, atau saat mengangkat peralatan berdinding tipis yang tidak tahan terhadap gaya tekan jepit horizontal.',
            ja: 'æšç¨‹ãŒé™ã‚‰ã‚Œã‚‹å ´åˆã‚„è§’åº¦ãŒ45Â°æœªæº€ã«ãªã‚‹å ´åˆã€ã¾ãŸæ°´å¹³åœ§ç¸®åŠ›ã«å¼±ã„è–„è‚‰æ©Ÿå™¨ã‚’åŠã‚‹éš›ã«ä½¿ç”¨ã—ã¾ã™ã€‚',
          },
          keywords: ['spreader', 'beam', 'angle', 'pinch', 'headroom'],
        },
      ],
      targetSelector: '[data-tour="rigging-angle"]',
    },
    {
      id: 'rigging-hitch-wll',
      badge: { en: 'Feature 3 Â· Hitch & WLL', id: 'Fitur 3 Â· Ikatan & WLL', ja: 'æ©Ÿèƒ½3 Â· ãƒ’ãƒƒãƒã¨WLL' },
      title: {
        en: 'Hitch Configuration (Î·) & Sling Rated WLL',
        id: 'Konfigurasi Ikatan (Î·) & Kapasitas WLL Sling',
        ja: 'çŽ‰æŽ›ã‘ãƒ’ãƒƒãƒæ–¹å¼ï¼ˆÎ·ï¼‰ã¨åŸºæœ¬ä½¿ç”¨è·é‡ï¼ˆWLLï¼‰',
      },
      description: {
        en: 'Select the Hitch Configuration (showing efficiency multiplier Î·) and choose one of the four color-coded Sling Rated Vertical WLL buttons. Effective WLL multiplies rated WLL by Î·.',
        id: 'Pilih Konfigurasi Ikatan (menampilkan faktor efisiensi Î·) dan tentukan salah satu dari empat tombol WLL Vertikal Terukur Sling berkode warna. WLL Efektif merupakan hasil perkalian WLL terukur dengan Î·.',
        ja: 'çŽ‰æŽ›ã‘ãƒ’ãƒƒãƒæ–¹å¼ï¼ˆåŠ¹çŽ‡ä¿‚æ•° Î· ã‚’è¡¨ç¤ºï¼‰ã¨4æ®µéšŽã®è‰²åˆ†ã‘ã•ã‚ŒãŸã‚¹ãƒªãƒ³ã‚°åŸºæœ¬ä½¿ç”¨è·é‡ï¼ˆWLLï¼‰ãƒœã‚¿ãƒ³ã‚’é¸æŠžã—ã¾ã™ã€‚å®ŸåŠ¹ WLL ã¯å®šæ ¼ WLL Ã— Î· ã¨ã—ã¦è¨ˆç®—ã•ã‚Œã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="rigging-hitch-wll"]',
    },
    {
      id: 'rigging-cog-hook',
      badge: { en: 'Feature 4 Â· CoG & Hook', id: 'Fitur 4 Â· CoG & Hook', ja: 'æ©Ÿèƒ½4 Â· é‡å¿ƒã¨ãƒ•ãƒƒã‚¯' },
      title: {
        en: 'CoG Offset, Hook Alignment & Payload Mass',
        id: 'Pergeseran CoG, Kesejajaran Hook & Massa Beban',
        ja: 'é‡å¿ƒã‚ªãƒ•ã‚»ãƒƒãƒˆãƒ»ãƒ•ãƒƒã‚¯èŠ¯å‡ºã—ãƒ»è³ªé‡',
      },
      description: {
        en: 'Drag CoG Offset (-30% to +30%), Crane Hook Horizontal Position, and Payload Mass (0.5â€“8.0 t) to observe unequal leg sharing and load tilt. Click "Align Hook Over CoG" to plumb the hook for a 0Â° level lift.',
        id: 'Atur Pergeseran CoG (-30% hingga +30%), Posisi Horizontal Hook, dan Massa Beban (0,5â€“8,0 t) untuk mengamati ketimpangan pembagian beban kaki dan kemiringan beban. Klik "Luruskan Hook ke CoG" untuk menyejajarkan hook tepat di atas CoG agar pengangkatan datar 0Â°.',
        ja: 'é‡å¿ƒã‚ªãƒ•ã‚»ãƒƒãƒˆãƒ»ãƒ•ãƒƒã‚¯æ°´å¹³ä½ç½®ãƒ»åŠã‚Šè·è³ªé‡ã‚’å‹•ã‹ã—ã¦è„šè·é‡ã®ä¸å‡è¡¡ã¨å‚¾æ–œã‚’ç¢ºèªã—ã¾ã™ã€‚ã€Œãƒ•ãƒƒã‚¯ã‚’é‡å¿ƒçœŸä¸Šã¸èŠ¯å‡ºã—ã€ã§æ°´å¹³æšé‡ï¼ˆ0Â°ï¼‰ã«åˆã‚ã›ã‚‰ã‚Œã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="rigging-cog-hook"]',
    },
    {
      id: 'rigging-canvas',
      badge: { en: 'Feature 5 Â· 2D Rigging Canvas', id: 'Fitur 5 Â· Tampilan 2D', ja: 'æ©Ÿèƒ½5 Â· 2Dæšé‡å›³' },
      title: {
        en: 'Live Overhead Crane & Sling Geometry SVG',
        id: 'Diagram SVG Overhead Crane & Geometri Sling Secara Langsung',
        ja: 'ãƒ©ã‚¤ãƒ–å¤©äº•ã‚¯ãƒ¬ãƒ¼ãƒ³ãƒ»ã‚¹ãƒªãƒ³ã‚°å¹¾ä½•å›³',
      },
      description: {
        en: 'Inspect the 2D hoisting rig: watch sling color coding, leg tension arrows, horizontal pinch vectors, CoG plumb line, and real-time load tilt on lift-off.',
        id: 'Amati sistem pengangkatan 2D: perhatikan kode warna sling, panah tegangan kaki, vektor gaya jepit horizontal, garis proyeksi vertikal CoG, dan kemiringan beban secara langsung saat terangkat.',
        ja: '2Dæšé‡å›³ã§ã‚¹ãƒªãƒ³ã‚°ç­‰ç´šè‰²ã€è„šå¼µåŠ›ãƒ™ã‚¯ãƒˆãƒ«ã€æ°´å¹³åœ§ç¸®åŠ›ã€é‡å¿ƒåž‚ç·šã€åœ°åˆ‡ã‚Šæ™‚ã®å‚¾ãã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã«ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="rigging-canvas"]',
    },
    {
      id: 'rigging-telemetry',
      badge: { en: 'Feature 6 Â· Telemetry', id: 'Fitur 6 Â· Telemetri', ja: 'æ©Ÿèƒ½6 Â· ãƒ†ãƒ¬ãƒ¡ãƒˆãƒª' },
      title: {
        en: 'WLL Utilization %, Angle Factor & Shackle Sizing',
        id: 'Utilisasi WLL %, Faktor Sudut & Ukuran Shackle',
        ja: 'WLLç¨¼åƒçŽ‡ãƒ»è§’åº¦å€çŽ‡ãƒ»æŽ¨å¥¨ã‚·ãƒ£ãƒƒã‚¯ãƒ«',
      },
      description: {
        en: 'Monitor Leg 1 & Leg 2 WLL Utilization bars, Angle Factor & Horizontal Pinch force, Required Headroom H, and the automatically sized Shackle Recommendation.',
        id: 'Pantau bilah Utilisasi WLL Kaki 1 & Kaki 2, Faktor Sudut & Gaya Jepit Horizontal, Kebutuhan Ruang Bebas Tinggi H, serta Rekomendasi Ukuran Shackle otomatis.',
        ja: 'è„š1ãƒ»è„š2ã®WLLç¨¼åƒçŽ‡ãƒãƒ¼ã€è§’åº¦å€çŽ‡ã¨æ°´å¹³åœ§ç¸®åŠ›ã€å¿…è¦æšç¨‹ Hã€æœ€å¤§è„šå¼µåŠ›ã«åŸºã¥ãæŽ¨å¥¨ã‚·ãƒ£ãƒƒã‚¯ãƒ«ã‚’ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="rigging-telemetry"]',
    },
    {
      id: 'rigging-angle-table',
      badge: { en: 'Feature 7 Â· Angle Table', id: 'Fitur 7 Â· Tabel Sudut', ja: 'æ©Ÿèƒ½7 Â· è§’åº¦ä¿‚æ•°è¡¨' },
      title: {
        en: 'ASME B30.9 1 / sin Î¸ Load Factor Reference',
        id: 'Tabel Referensi Faktor Beban 1 / sin Î¸ ASME B30.9',
        ja: 'ASME B30.9 1/sin Î¸ å¼µåŠ›ä¿‚æ•°ãƒ†ãƒ¼ãƒ–ãƒ«',
      },
      description: {
        en: 'Compare your active angle Î¸ against ASME B30.9 zones: Optimal (â‰¥60Â°), Caution (45Â°), Critical (30Â°), and Forbidden (<30Â°).',
        id: 'Bandingkan sudut Î¸ aktif terhadap zona ASME B30.9: Optimal (â‰¥60Â°), Waspada (45Â°), Kritis (30Â°), dan Dilarang (<30Â°).',
        ja: 'ç¾åœ¨ã®è§’åº¦ Î¸ ãŒASME B30.9ã®æŽ¨å¥¨ï¼ˆâ‰¥60Â°ï¼‰ãƒ»æ³¨æ„ï¼ˆ45Â°ï¼‰ãƒ»é™ç•Œï¼ˆ30Â°ï¼‰ãƒ»ç¦æ­¢ï¼ˆ<30Â°ï¼‰ã®ã©ã®ã‚¾ãƒ¼ãƒ³ã«ã‚ã‚‹ã‹ä¸€ç›®ã§æ¯”è¼ƒã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="rigging-angle-table"]',
    },
    {
      id: 'rigging-safety-banner',
      badge: { en: 'Feature 8 Â· Troubleshoot', id: 'Fitur 8 Â· Diagnosis Masalah', ja: 'æ©Ÿèƒ½8 Â· ãƒˆãƒ©ãƒ–ãƒ«å¯¾ç­–' },
      title: {
        en: 'ASME B30.9 Alarm & Troubleshooting Banner',
        id: 'Panel Peringatan & Penanganan Masalah ASME B30.9',
        ja: 'ASME B30.9 è­¦å ±ãƒ»ãƒˆãƒ©ãƒ–ãƒ«ã‚·ãƒ¥ãƒ¼ãƒ†ã‚£ãƒ³ã‚°',
      },
      description: {
        en: 'Watch the top Safety Status Banner: it stays green when safe and raises Caution or Danger alarms for low sling angles (Î¸ â‰¤ 30Â°), WLL overloads (>100%), or off-plumb hook misalignment. Troubleshoot by steepening Î¸, enabling a Spreader Beam, upgrading WLL, or aligning the hook over CoG.',
        id: 'Pantau Panel Status Keselamatan di bagian atas: berwarna hijau saat aman, serta memicu peringatan Waspada atau Bahaya untuk sudut sling rendah (Î¸ â‰¤ 30Â°), beban berlebih WLL (>100%), atau ketidakselarasan posisi hook terhadap CoG. Atasi masalah dengan memperbesar Î¸, mengaktifkan Spreader Beam, menaikkan kapasitas WLL, atau meluruskan hook ke atas CoG.',
        ja: 'ä¸Šéƒ¨ã®å®‰å…¨ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹ãƒãƒŠãƒ¼ã¯ã€ä½Žè§’åº¦ï¼ˆÎ¸ â‰¤ 30Â°ï¼‰ã€WLLè¶…éŽï¼ˆ>100%ï¼‰ã€ãƒ•ãƒƒã‚¯èŠ¯ãšã‚Œã‚’æ¤œçŸ¥ã™ã‚‹ã¨æ³¨æ„ãƒ»å±é™ºè­¦å ±ã‚’è¡¨ç¤ºã—ã¾ã™ã€‚è§’åº¦æ”¹å–„ã€å¤©ç§¤ãƒ“ãƒ¼ãƒ ä½¿ç”¨ã€WLLå¢—åŠ ã€èŠ¯å‡ºã—ã§è­¦å ±ã‚’è§£æ¶ˆã—ã¾ã—ã‚‡ã†ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'Why is my leg WLL utilization > 100% even though payload < rated WLL?',
            id: 'Mengapa utilisasi WLL kaki sling melebihi 100% padahal massa beban lebih kecil dari WLL terukur?',
            ja: 'åŠã‚Šè·è³ªé‡ãŒå®šæ ¼WLLæœªæº€ãªã®ã«ç¨¼åƒçŽ‡ãŒ100%ã‚’è¶…ãˆã‚‹ã®ã¯ãªãœï¼Ÿ',
          },
          a: {
            en: 'Three factors amplify leg tension: low sling angle Î¸ (1/sin Î¸), reduced choker hitch efficiency (Î· = 0.75Ã—), and off-center CoG shifting most of the weight onto one leg.',
            id: 'Tiga faktor memperbesar tegangan kaki sling: sudut sling rendah Î¸ (faktor 1/sin Î¸), penurunan efisiensi ikatan choker (Î· = 0,75Ã—), serta pergeseran CoG yang memusatkan sebagian besar beban pada salah satu kaki.',
            ja: 'ä½Žè§’åº¦ã«ã‚ˆã‚‹å¼µåŠ›å€çŽ‡ï¼ˆ1/sin Î¸ï¼‰ã€ãƒãƒ§ãƒ¼ã‚«ãƒ¼åŠã‚Šã«ã‚ˆã‚‹åŠ¹çŽ‡ä½Žä¸‹ï¼ˆÎ·=0.75Ã—ï¼‰ã€é‡å¿ƒåå¿ƒã«ã‚ˆã‚‹ç‰‡å´è„šã¸ã®è·é‡é›†ä¸­ãŒé‡ãªã‚‹ãŸã‚ã§ã™ã€‚',
          },
          keywords: ['overload', 'wll', '100%', 'choker', 'cog', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="rigging-safety-banner"]',
    },
    {
      id: 'rigging-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice solving rigging load-factor and CoG problems, and the Quiz tab.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal faktor beban dan CoG, serta tab Kuis.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€çŽ‰æŽ›ã‘è¨ˆç®—ã®ç†è§£åº¦ã‚’ç¢ºèªã—ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'screw-conveyor': [
    {
      id: 'screw-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'CEMA 350 Screw Conveyor Lab',
        id: 'Lab Konveyor Ulir CEMA 350',
        ja: 'CEMA 350 ã‚¹ã‚¯ãƒªãƒ¥ãƒ¼ã‚³ãƒ³ãƒ™ãƒ¤æ¦‚è¦',
      },
      description: {
        en: 'Welcome! This simulator models bulk solids transport inside a helical auger trough using CEMA 350 equationsâ€”tracking mass flow, torque, power, hanger bearing heat, and jam risk.',
        id: 'Selamat datang! Simulator ini memodelkan pengangkutan material curah di dalam palung ulir heliks menggunakan persamaan CEMA 350â€”memantau laju aliran massa, torsi, daya penggerak, kenaikan suhu bantalan gantung, dan risiko kemacetan.',
        ja: 'ã‚ˆã†ã“ãï¼CEMA 350å·¥å­¦å¼ã«åŸºã¥ãã€ã‚¹ã‚¯ãƒªãƒ¥ãƒ¼ã‚ªãƒ¼ã‚¬ãƒ¼ã«ã‚ˆã‚‹ç²‰ç²’ä½“æ¬é€ã®æµé‡ã€ãƒˆãƒ«ã‚¯ã€å‹•åŠ›ã€è»¸å—æ¸©åº¦ã€é–‰å¡žãƒªã‚¹ã‚¯ã‚’è§£æžã—ã¾ã™ã€‚',
      },
      tip: {
        en: 'Higher trough fill (e.g. 95%) boosts capacity only until bridging and torque spikes occur.',
        id: 'Tingkat pengisian palung yang tinggi (misalnya 95%) hanya meningkatkan kapasitas hingga batas tertentu sebelum memicu penyumbatan (bridging) dan lonjakan torsi.',
        ja: 'é«˜å……å¡«çŽ‡ï¼ˆ95%ç­‰ï¼‰ã¯é–‰å¡žã¨ãƒˆãƒ«ã‚¯æ€¥å¢—ã®ãƒªã‚¹ã‚¯ã‚’ä¼´ã†ãŸã‚ã€ææ–™ç‰¹æ€§ã«å¿œã˜ãŸæŽ¨å¥¨å……å¡«çŽ‡ã‚’å®ˆã‚Šã¾ã—ã‚‡ã†ã€‚',
      },
    },
    {
      id: 'screw-material',
      badge: { en: 'Feature 1 Â· Bulk Material', id: 'Fitur 1 Â· Material Curah', ja: 'æ©Ÿèƒ½1 Â· æ¬é€ç‰©è¨­å®š' },
      title: {
        en: 'Bulk Material Presets',
        id: 'Preset Material Curah',
        ja: 'æ¬é€ç‰©ãƒ—ãƒªã‚»ãƒƒãƒˆ',
      },
      description: {
        en: 'Select a Bulk Material pill (Grain, Cement, Limestone, Woodchips, or Sand) above the cutaway SVG to auto-load its bulk density Ï, material factor Fm, and recommended trough fill.',
        id: 'Pilih tombol Material Curah (Biji-bijian, Semen, Batu Kapur, Serpihan Kayu, atau Pasir) di atas diagram potongan SVG untuk memuat densitas curah Ï, faktor material Fm, dan tingkat pengisian palung yang direkomendasikan secara otomatis.',
        ja: 'å›³ã®ä¸Šéƒ¨ã®æ¬é€ç‰©ãƒœã‚¿ãƒ³ï¼ˆç©€ç‰©ãƒ»ã‚»ãƒ¡ãƒ³ãƒˆãƒ»çŸ³ç°çŸ³ãƒ»æœ¨è³ªãƒãƒƒãƒ—ãƒ»ç ‚ï¼‰ã§ã‹ã•å¯†åº¦ Ïã€ææ–™ä¿‚æ•° Fmã€æŽ¨å¥¨å……å¡«çŽ‡ã‚’ä¸€æ‹¬è¨­å®šã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="screw-material"]',
    },
    {
      id: 'screw-canvas',
      badge: { en: 'Feature 2 Â· Cutaway SVG', id: 'Fitur 2 Â· Penampang SVG', ja: 'æ©Ÿèƒ½2 Â· æ–­é¢ã‚¢ãƒ‹ãƒ¡ãƒ¼ã‚·ãƒ§ãƒ³' },
      title: {
        en: 'Live Helical Auger Cutaway & Flow Animation',
        id: 'Penampang Ulir Heliks & Animasi Aliran Secara Langsung',
        ja: 'ã‚¹ã‚¯ãƒªãƒ¥ãƒ¼æ–­é¢ãƒ»æ¬é€ã‚¢ãƒ‹ãƒ¡ãƒ¼ã‚·ãƒ§ãƒ³',
      },
      description: {
        en: 'Observe the rotating helical flights, intermediate hanger bearings, trough fill height, radial clearance carryback, and thermal/jam indicators in real time.',
        id: 'Amati putaran daun ulir heliks, bantalan gantung antara (hanger bearing), ketinggian isi palung, aliran balik pada celah radial, serta indikator panas berlebih dan kemacetan secara langsung.',
        ja: 'å›žè»¢ã™ã‚‹ã‚¹ã‚¯ãƒªãƒ¥ãƒ¼ç¾½æ ¹ã€ä¸­é–“ãƒãƒ³ã‚¬ãƒ¼è»¸å—ã€ãƒˆãƒ©ãƒ•å……å¡«é«˜ã•ã€éš™é–“ã®é€†æµã€éŽç†±ãƒ»é–‰å¡žçŠ¶æ…‹ã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã«è¦³å¯Ÿã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="screw-canvas"]',
    },
    {
      id: 'screw-geometry',
      badge: { en: 'Feature 3 Â· Auger Geometry', id: 'Fitur 3 Â· Geometri Ulir', ja: 'æ©Ÿèƒ½3 Â· ã‚ªãƒ¼ã‚¬ãƒ¼å¹¾ä½•è«¸å…ƒ' },
      title: {
        en: 'Screw Diameter, Pitch Mode & Clearances',
        id: 'Diameter Ulir, Mode Kisar (Pitch) & Celah Radial',
        ja: 'ã‚¹ã‚¯ãƒªãƒ¥ãƒ¼å¤–å¾„ãƒ»ãƒ”ãƒƒãƒãƒ¢ãƒ¼ãƒ‰ãƒ»éš™é–“è¨­å®š',
      },
      description: {
        en: 'In Group 1 (Auger Geometry), adjust Screw Diameter D (150â€“600 mm) and Center Pipe dâ‚š. Choose a Pitch Modeâ€”Std (1.0D), Half (0.67D), or Short (0.5D)â€”or drag Pitch P, Length L, and Radial Clearance.',
        id: 'Pada Grup 1 (Geometri Ulir), atur Diameter Ulir D (150â€“600 mm) dan Diameter Pipa Poros dâ‚š. Pilih Mode Pitchâ€”Standar (1,0D), 2/3 (0,67D), atau Pendek (0,5D)â€”atau sesuaikan Pitch P, Panjang L, dan Celah Radial.',
        ja: 'ã‚°ãƒ«ãƒ¼ãƒ—1ã§ã‚¹ã‚¯ãƒªãƒ¥ãƒ¼å¤–å¾„ Dï¼ˆ150ã€œ600 mmï¼‰ã¨ä¸­å¿ƒè»¸ãƒ‘ã‚¤ãƒ—å¾„ dâ‚š ã‚’è¨­å®šã—ã¾ã™ã€‚ãƒ”ãƒƒãƒãƒ¢ãƒ¼ãƒ‰ï¼ˆæ¨™æº–ãƒ»2/3ãƒ»çŸ­ï¼‰ã‚„ãƒ”ãƒƒãƒ Pã€å…¨é•· Lã€éš™é–“ã‚’èª¿æ•´ã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="screw-geometry"]',
    },
    {
      id: 'screw-operating',
      badge: { en: 'Feature 4 Â· Operating & Fill', id: 'Fitur 4 Â· Operasi & Pengisian', ja: 'æ©Ÿèƒ½4 Â· å……å¡«çŽ‡ã¨é‹è»¢æ¡ä»¶' },
      title: {
        en: 'Trough Fill %, Speed & Incline',
        id: 'Persentase Pengisian Palung, Putaran & Kemiringan',
        ja: 'ãƒˆãƒ©ãƒ•å……å¡«çŽ‡ãƒ»å›žè»¢æ•°ãƒ»å‚¾æ–œè¨­å®š',
      },
      description: {
        en: 'In Group 2, click Trough Loading Fill % (15%, 30%, 45%, or 95%), adjust Speed (10â€“120 RPM), and tilt Incline Î¸ (0Â°â€“45Â°) to see how inclination factor KÎ¸ and fill affect capacity and torque.',
        id: 'Pada Grup 2, pilih Persentase Pengisian Palung (15%, 30%, 45%, atau 95%), atur Kecepatan Putar (10â€“120 RPM), dan Sudut Kemiringan Î¸ (0Â°â€“45Â°) untuk mengamati pengaruh faktor kemiringan KÎ¸ serta tingkat pengisian terhadap kapasitas dan torsi.',
        ja: 'ã‚°ãƒ«ãƒ¼ãƒ—2ã§ãƒˆãƒ©ãƒ•å……å¡«çŽ‡ï¼ˆ15/30/45/95%ï¼‰ã€å›žè»¢æ•°ï¼ˆ10ã€œ120 RPMï¼‰ã€å‚¾æ–œ Î¸ï¼ˆ0Â°ã€œ45Â°ï¼‰ã‚’å¤‰æ›´ã—ã€å‚¾æ–œä¿‚æ•° KÎ¸ ã‚„å……å¡«çŽ‡ã®å½±éŸ¿ã‚’ç¢ºèªã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="screw-operating"]',
    },
    {
      id: 'screw-factors',
      badge: { en: 'Feature 5 Â· CEMA Factors', id: 'Fitur 5 Â· Faktor CEMA', ja: 'æ©Ÿèƒ½5 Â· CEMAä¿‚æ•°' },
      title: {
        en: 'Bulk Density Ï, Material Fm & Bearing Fb',
        id: 'Densitas Curah Ï, Faktor Material Fm & Bantalan Fb',
        ja: 'ã‹ã•å¯†åº¦ Ïãƒ»ææ–™ä¿‚æ•° Fmãƒ»è»¸å—ä¿‚æ•° Fb',
      },
      description: {
        en: 'Fine-tune Bulk Density Ï (300â€“2000 kg/mÂ³), Material Factor Fm (0.4â€“2.5), and Hanger Bearing Factor Fb (1.0â€“4.4) to model custom bulk solids or worn bearing friction.',
        id: 'Sesuaikan Densitas Curah Ï (300â€“2000 kg/mÂ³), Faktor Material Fm (0,4â€“2,5), dan Faktor Bantalan Gantung Fb (1,0â€“4,4) untuk memodelkan material curah khusus atau gesekan bantalan yang aus.',
        ja: 'ã‹ã•å¯†åº¦ Ïï¼ˆ300ã€œ2000 kg/mÂ³ï¼‰ã€ææ–™ä¿‚æ•° Fmï¼ˆ0.4ã€œ2.5ï¼‰ã€è»¸å—ä¿‚æ•° Fbï¼ˆ1.0ã€œ4.4ï¼‰ã‚’å¾®èª¿æ•´ã—ã€ä»»æ„ç²‰ä½“ã‚„è»¸å—æ‘©æ“¦ã®å½±éŸ¿ã‚’è§£æžã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="screw-factors"]',
    },
    {
      id: 'screw-telemetry',
      badge: { en: 'Feature 6 Â· Telemetry', id: 'Fitur 6 Â· Telemetri', ja: 'æ©Ÿèƒ½6 Â· ãƒ†ãƒ¬ãƒ¡ãƒˆãƒª' },
      title: {
        en: 'Six Live CEMA 350 Telemetry KPIs',
        id: 'Enam Indikator Kinerja (KPI) Telemetri CEMA 350',
        ja: '6ã¤ã®ãƒ©ã‚¤ãƒ–CEMA 350ãƒ†ãƒ¬ãƒ¡ãƒˆãƒªKPI',
      },
      description: {
        en: 'Monitor Mass/Vol Flow, Torque/Axial Speed, Drive Power/Current, Axial Thrust/Deflection, Hanger Bearings temp, and Shear/Jam Risk with carryback %.',
        id: 'Pantau Laju Aliran Massa/Volumetrik, Torsi/Kecepatan Aksial, Daya/Arus Motor Penggerak, Gaya Aksial/Defleksi Poros, Suhu Bantalan Gantung, serta Risiko Geser/Kemacetan beserta persentase aliran balik.',
        ja: 'è³ªé‡æµé‡ãƒ»ãƒˆãƒ«ã‚¯ãƒ»æ‰€è¦å‹•åŠ›ãƒ»ã‚¹ãƒ©ã‚¹ãƒˆ/ãŸã‚ã¿ãƒ»è»¸å—æ¸©åº¦ãƒ»é–‰å¡žãƒªã‚¹ã‚¯/é€†æµçŽ‡ã®6ã¤ã®KPIã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã§ç›£è¦–ã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="screw-telemetry"]',
    },
    {
      id: 'screw-faults',
      badge: { en: 'Feature 7 Â· Troubleshoot', id: 'Fitur 7 Â· Diagnosis Masalah', ja: 'æ©Ÿèƒ½7 Â· æ•…éšœè¨ºæ–­' },
      title: {
        en: 'Fault Injection & CEMA 350 Troubleshooting',
        id: 'Simulasi Gangguan & Penanganan Masalah CEMA 350',
        ja: 'æ•…éšœæ³¨å…¥ã¨CEMA 350ãƒˆãƒ©ãƒ–ãƒ«ã‚·ãƒ¥ãƒ¼ãƒ†ã‚£ãƒ³ã‚°',
      },
      description: {
        en: 'Inject faults in the top Fault Mode bar: Hanger Bearing Overheat (>115Â°C), Flight Abrasion / Carryback (+14 mm clearance loss), or Overfill / Torque Jam (2.65Ã— torque surge). Read the CEMA 350 Engineering Diagnostic panel below to identify the root cause, then click "Clear Fault" to restore Normal Run.',
        id: 'Simulasikan gangguan pada bilah Mode Gangguan di bagian atas: Bantalan Gantung Panas Berlebih (>115Â°C), Keausan Daun Ulir / Aliran Balik (penambahan celah +14 mm), atau Pengisian Berlebih / Kemacetan Torsi (lonjakan torsi 2,65Ã—). Baca panel Diagnostik Teknik CEMA 350 di bawah untuk mengidentifikasi akar masalah, lalu klik "Hapus Gangguan" untuk memulihkan operasi normal.',
        ja: 'ä¸Šéƒ¨ã®æ•…éšœãƒ¢ãƒ¼ãƒ‰ãƒãƒ¼ã§ã€Œãƒãƒ³ã‚¬ãƒ¼è»¸å—éŽç†±ã€ã€Œç¾½æ ¹æ‘©è€—ãƒ»é€†æµã€ã€ŒéŽå……å¡«ãƒ»ãƒˆãƒ«ã‚¯æ€¥å¢—ã€ã‚’ç™ºç”Ÿã•ã›ã€ä¸‹éƒ¨ã®å·¥å­¦è¨ºæ–­ãƒ‘ãƒãƒ«ã§åŽŸå› ã‚’ç‰¹å®šã§ãã¾ã™ã€‚ã€Œæ•…éšœè§£é™¤ã€ã§æ­£å¸¸é‹è»¢ã¸æˆ»ã‚Šã¾ã™ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'How do I tell flight abrasion from an overfill jam?',
            id: 'Bagaimana cara membedakan keausan daun ulir dari kemacetan akibat pengisian berlebih?',
            ja: 'ç¾½æ ¹æ‘©è€—ã¨éŽå……å¡«é–‰å¡žã¯ã©ã†è¦‹åˆ†ã‘ã¾ã™ã‹ï¼Ÿ',
          },
          a: {
            en: 'Flight abrasion widens radial clearance (+14 mm), raising carryback % and dropping net throughput. Overfill jam spikes drive torque (2.65Ã—), motor current, and shear/jam risk above 75%.',
            id: 'Keausan daun ulir memperlebar celah radial (+14 mm), sehingga meningkatkan persentase aliran balik dan menurunkan kapasitas angkut bersih. Sebaliknya, kemacetan akibat pengisian berlebih menyebabkan lonjakan torsi penggerak (2,65Ã—), arus motor, dan risiko kemacetan di atas 75%.',
            ja: 'ç¾½æ ¹æ‘©è€—ã¯éš™é–“æ‹¡å¤§ï¼ˆ+14mmï¼‰ã«ã‚ˆã‚Šé€†æµçŽ‡ãŒå¢—ãˆæ­£å‘³æµé‡ãŒè½ã¡ã¾ã™ã€‚éŽå……å¡«é–‰å¡žã¯ãƒˆãƒ«ã‚¯2.65å€æ€¥å¢—ã¨éŽè² è·é›»æµãƒ»é–‰å¡žãƒªã‚¹ã‚¯ä¸Šæ˜‡ã‚’å¼•ãèµ·ã“ã—ã¾ã™ã€‚',
          },
          keywords: ['abrasion', 'overfill', 'jam', 'carryback', 'torque', 'fault'],
        },
      ],
      targetSelector: '[data-tour="screw-faults"]',
    },
    {
      id: 'screw-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice sizing an inclined feeder, and the CEMA 350 Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan perhitungan kapasitas konveyor miring, dan Kuis CEMA 350.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€CEMA 350ã®ç†è§£ã‚’æ·±ã‚ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'thermal-expansion': [
    {
      id: 'thermal-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'Thermal Expansion, Shrink Fit & Bimetallic Lab',
        id: 'Lab Ekspansi Termal, Suaian Susut & Bimetal',
        ja: 'ç†±è†¨å¼µãƒ»ç„¼ãã°ã‚ãƒ»ãƒã‚¤ãƒ¡ã‚¿ãƒ«å·¥å­¦ãƒ©ãƒœ',
      },
      description: {
        en: 'Welcome! Explore how temperature changes drive free strain, restrained thermal stress, shrink-fit interference pressure, and Timoshenko bimetallic bending across a live 2D CAD viewport.',
        id: 'Selamat datang! Pelajari bagaimana perubahan suhu menimbulkan regangan bebas, tegangan termal terkekang, tekanan kontak suaian susut, serta kelengkungan bimetal Timoshenko pada tampilan CAD 2D secara langsung.',
        ja: 'ã‚ˆã†ã“ãï¼æ¸©åº¦å¤‰åŒ–ãŒè‡ªç”±ç†±è†¨å¼µã€æ‹˜æŸç†±å¿œåŠ›ã€ç„¼ãã°ã‚æŽ¥è§¦é¢åœ§ã€ãƒ†ã‚£ãƒ¢ã‚·ã‚§ãƒ³ã‚³ãƒ»ãƒã‚¤ãƒ¡ã‚¿ãƒ«æ›²çŽ‡ã«ä¸Žãˆã‚‹å½±éŸ¿ã‚’2D CADå›³ã§ä½“é¨“ã—ã¾ã™ã€‚',
      },
      tip: {
        en: 'When thermal expansion is blocked by a rigid abutment, strain converts directly into compressive stress Ïƒ = EÂ·Î±Â·Î”T.',
        id: 'Apabila pemuaian termal terhalang oleh penahan kaku, regangan termal langsung berubah menjadi tegangan tekan Ïƒ = EÂ·Î±Â·Î”T.',
        ja: 'ç†±è†¨å¼µãŒå‰›ä½“å£ã§æ‹˜æŸã•ã‚Œã‚‹ã¨ã€ã²ãšã¿ã¯ãã®ã¾ã¾åœ§ç¸®ç†±å¿œåŠ› Ïƒ = EÂ·Î±Â·Î”T ã¸ã¨å¤‰æ›ã•ã‚Œã¾ã™ã€‚',
      },
    },
    {
      id: 'thermal-modes',
      badge: { en: 'Feature 1 Â· Lab Modes', id: 'Fitur 1 Â· Mode Lab', ja: 'æ©Ÿèƒ½1 Â· 3ã¤ã®ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Three Thermal Mechanics Modes',
        id: 'Tiga Mode Mekanika Termal',
        ja: '3ã¤ã®ç†±åŠ›å­¦ãƒ¢ãƒ¼ãƒ‰åˆ‡æ›¿',
      },
      description: {
        en: 'Switch between three modules: 1. Bar & Restrained Stress, 2. Shrink Fit Hub-on-Shaft (LamÃ© thick-cylinder), and 3. Bimetallic Thermostat.',
        id: 'Beralihlah di antara tiga modul: 1. Batang & Tegangan Terkekang, 2. Suaian Susut Hub-pada-Poros (teori silinder tebal LamÃ©), dan 3. Termostat Bimetal.',
        ja: 'ã€Œ1. æ£’è†¨å¼µãƒ»ç†±å¿œåŠ›æ‹˜æŸã€ã€Œ2. è»¸ãƒ»ãƒãƒ–ç„¼ãã°ã‚ï¼ˆãƒ©ãƒ¡ç†è«–ï¼‰ã€ã€Œ3. ãƒã‚¤ãƒ¡ã‚¿ãƒ«ç´ å­ã€ã®3ãƒ¢ã‚¸ãƒ¥ãƒ¼ãƒ«ã‚’åˆ‡ã‚Šæ›¿ãˆã‚‰ã‚Œã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="thermal-modes"]',
    },
    {
      id: 'thermal-presets',
      badge: { en: 'Feature 2 Â· Presets & Export', id: 'Fitur 2 Â· Preset & Ekspor', ja: 'æ©Ÿèƒ½2 Â· ãƒ—ãƒªã‚»ãƒƒãƒˆã¨å‡ºåŠ›' },
      title: {
        en: 'Scenario Presets, Reset & CSV Export',
        id: 'Preset Skenario, Reset & Ekspor CSV',
        ja: 'ã‚·ãƒŠãƒªã‚ªãƒ—ãƒªã‚»ãƒƒãƒˆãƒ»ãƒªã‚»ãƒƒãƒˆãƒ»CSVå‡ºåŠ›',
      },
      description: {
        en: 'Load classic industrial scenarios from the Preset dropdown, click Reset to restore mode defaults, or click CSV to export the active modeâ€™s parameters and results.',
        id: 'Muat skenario industri klasik melalui daftar pilihan Preset, klik Reset untuk mengembalikan nilai bawaan modul, atau klik CSV untuk mengekspor parameter dan hasil perhitungan modul aktif.',
        ja: 'ãƒ—ãƒªã‚»ãƒƒãƒˆã‹ã‚‰å®Ÿå‹™ã‚·ãƒŠãƒªã‚ªã‚’èª­ã¿è¾¼ã‚“ã ã‚Šã€ãƒªã‚»ãƒƒãƒˆã§åˆæœŸå€¤ã«æˆ»ã—ãŸã‚Šã€CSVãƒœã‚¿ãƒ³ã§è¨ˆç®—ãƒ‡ãƒ¼ã‚¿ã‚’å‡ºåŠ›ã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="thermal-presets"]',
    },
    {
      id: 'thermal-canvas',
      badge: { en: 'Feature 3 Â· 2D CAD View', id: 'Fitur 3 Â· Tampilan CAD', ja: 'æ©Ÿèƒ½3 Â· 2D CADå¯è¦–åŒ–' },
      title: {
        en: 'Live 2D Thermal Deformation & Contact SVG',
        id: 'Diagram SVG Deformasi Termal & Kontak 2D Secara Langsung',
        ja: 'ãƒ©ã‚¤ãƒ–2Dç†±å¤‰å½¢ãƒ»æŽ¥è§¦CADå›³',
      },
      description: {
        en: 'Watch real-time bar elongation against abutment gaps (Mode 1), hub bore expansion over shaft interference (Mode 2), or bimetallic strip curvature toward the trip contact (Mode 3).',
        id: 'Amati pemanjangan batang terhadap celah penahan (Mode 1), pemuaian lubang hub terhadap interferensi poros (Mode 2), atau kelengkungan bilah bimetal menuju kontak pemutus (Mode 3) secara langsung.',
        ja: 'æ£’ã®ä¼¸ã³ã¨å£å½“æŽ¥ï¼ˆãƒ¢ãƒ¼ãƒ‰1ï¼‰ã€ãƒãƒ–å†…å¾„è†¨å¼µã¨åµŒåˆéš™é–“ï¼ˆãƒ¢ãƒ¼ãƒ‰2ï¼‰ã€ãƒã‚¤ãƒ¡ã‚¿ãƒ«ã®æ¹¾æ›²ã¨æŽ¥ç‚¹å‹•ä½œï¼ˆãƒ¢ãƒ¼ãƒ‰3ï¼‰ã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ è¡¨ç¤ºã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="thermal-canvas"]',
    },
    {
      id: 'thermal-controls',
      badge: { en: 'Feature 4 Â· Thermal Controls', id: 'Fitur 4 Â· Kontrol Termal', ja: 'æ©Ÿèƒ½4 Â· ãƒ‘ãƒ©ãƒ¡ãƒ¼ã‚¿èª¿æ•´' },
      title: {
        en: 'Materials, Temperature & Geometry Controls',
        id: 'Kontrol Material, Suhu & Geometri',
        ja: 'ææ–™ãƒ»æ¸©åº¦ãƒ»å¯¸æ³•ãƒ‘ãƒ©ãƒ¡ãƒ¼ã‚¿èª¿æ•´',
      },
      description: {
        en: 'Adjust material alloys, operating temperature Î”T, dimensions, expansion gaps (Mode 1), hub interference Î´ (Mode 2), or bimetallic layer thicknesses and contact trip gap (Mode 3).',
        id: 'Sesuaikan jenis paduan material, selisih suhu operasi Î”T, dimensi, celah ekspansi (Mode 1), interferensi hub Î´ (Mode 2), atau ketebalan lapisan bimetal serta celah kontak pemutus (Mode 3).',
        ja: 'ææ–™ã€æ¸©åº¦å·® Î”Tã€å¯¸æ³•ã€è†¨å¼µéš™é–“ï¼ˆãƒ¢ãƒ¼ãƒ‰1ï¼‰ã€ã—ã¾ã‚Šã°ã‚é‡ Î´ï¼ˆãƒ¢ãƒ¼ãƒ‰2ï¼‰ã€ãƒã‚¤ãƒ¡ã‚¿ãƒ«å±¤åŽšãƒ»æŽ¥ç‚¹éš™é–“ï¼ˆãƒ¢ãƒ¼ãƒ‰3ï¼‰ã‚’èª¿æ•´ã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="thermal-controls"]',
    },
    {
      id: 'thermal-telemetry',
      badge: { en: 'Feature 5 Â· Troubleshoot', id: 'Fitur 5 Â· Diagnosis Masalah', ja: 'æ©Ÿèƒ½5 Â· é™ç•Œè¨ºæ–­' },
      title: {
        en: 'Yield, Clearance & Trip Diagnostics',
        id: 'Diagnostik Batas Luluh, Celah & Pemutusan Sakelar',
        ja: 'é™ä¼ãƒ»éš™é–“ãƒ»ãƒˆãƒªãƒƒãƒ—ç•°å¸¸è¨ºæ–­',
      },
      description: {
        en: 'Use the 4 telemetry cards to troubleshoot failures: check if Thermal Stress exceeds Yield (redâ€”add expansion gap Î´_gap or lower Î”T), whether Hot Clearance is TIGHT (increase Hub Heating Î”T above Min Req), whether Hub Von Mises SF warns of Plastic Yield (reduce Î´ or thicken Dâ‚€), or when Bimetallic Switch Status trips CLOSED.',
        id: 'Gunakan 4 kartu telemetri untuk mendiagnosis kegagalan: periksa apakah Tegangan Termal melampaui Batas Luluh (indikator merahâ€”perbesar celah Î´_gap atau turunkan Î”T), apakah Celah Panas berstatus KURANG PANAS / TIGHT (naikkan Pemanasan Hub Î”T di atas nilai Minimum yang Disyaratkan), apakah Faktor Keamanan Von Mises Hub memperingatkan Luluh Plastis (kurangi Î´ atau perbesar Dâ‚€), atau pantau status pemutusan sakelar bimetal.',
        ja: '4ã¤ã®ãƒ†ãƒ¬ãƒ¡ãƒˆãƒªã‚«ãƒ¼ãƒ‰ã§ç•°å¸¸ã‚’è¨ºæ–­ã§ãã¾ã™ã€‚ç†±å¿œåŠ›ã®é™ä¼è¶…éŽï¼ˆéš™é–“å¢—åŠ ã¾ãŸã¯Î”Tä½Žæ¸›ï¼‰ã€åŠ ç†±ä¸è¶³ï¼ˆå¿…è¦Î”Tä»¥ä¸Šã¸åŠ ç†±ï¼‰ã€ãƒãƒ–å¡‘æ€§é™ä¼è­¦å‘Šï¼ˆÎ´ä½Žæ¸›ã¾ãŸã¯Dâ‚€æ‹¡å¤§ï¼‰ã€ãƒã‚¤ãƒ¡ã‚¿ãƒ«ã®ãƒˆãƒªãƒƒãƒ—çŠ¶æ…‹ã‚’ç‰¹å®šã—å¯¾ç­–ã—ã¾ã—ã‚‡ã†ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'How do I fix "TIGHT (NEED HEAT)" in Shrink Fit mode?',
            id: 'Bagaimana cara mengatasi status "KURANG PANAS" (TIGHT) pada mode Suaian Susut?',
            ja: 'ç„¼ãã°ã‚ãƒ¢ãƒ¼ãƒ‰ã®ã€ŒåŠ ç†±ä¸è¶³ã€ã¯ã©ã†è§£æ¶ˆã—ã¾ã™ã‹ï¼Ÿ',
          },
          a: {
            en: 'Increase Hub Heating Î”T above the "Min Req" value shown under the slider so thermal expansion of the hub bore exceeds the diametral interference Î´.',
            id: 'Naikkan Pemanasan Hub Î”T melampaui nilai batas minimum ("Min Req") yang tertera di bawah penggeser agar pemuaian termal lubang hub melebihi interferensi diametral Î´.',
            ja: 'ã‚¹ãƒ©ã‚¤ãƒ€ãƒ¼ä¸‹ã®ã€ŒMin Reqï¼ˆå¿…è¦æœ€å°æ¸©åº¦å·®ï¼‰ã€ä»¥ä¸Šã«ãƒãƒ–åŠ ç†±æ¸©åº¦å·® Î”T ã‚’ä¸Šã’ã€å†…å¾„è†¨å¼µé‡ãŒã—ã¾ã‚Šã°ã‚é‡ Î´ ã‚’ä¸Šå›žã‚‹ã‚ˆã†ã«ã—ã¾ã™ã€‚',
          },
          keywords: ['tight', 'need heat', 'shrink fit', 'clearance', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="thermal-telemetry"]',
    },
    {
      id: 'thermal-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice thermal strain and shrink-fit problems, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal regangan termal dan suaian susut, serta Kuis.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€ç†±åŠ›å­¦ã®è¨ˆç®—åŠ›ã‚’å®šç€ã•ã›ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'utm-testing': [
    {
      id: 'utm-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'Universal Testing Machine (ASTM E8 / E9)',
        id: 'Mesin Uji Universal (ASTM E8 / E9)',
        ja: 'ä¸‡èƒ½è©¦é¨“æ©Ÿï¼ˆASTM E8 / E9ï¼‰ãƒ©ãƒœ',
      },
      description: {
        en: 'Welcome! Simulate tensile (ASTM E8) and compression (ASTM E9) testing on a 2D load frame with real-time Stressâ€“Strain curves, specimen necking/fracture, and extracted ASTM properties.',
        id: 'Selamat datang! Simulasikan pengujian tarik (ASTM E8) dan tekan (ASTM E9) pada rangka pembebanan 2D yang dilengkapi kurva Teganganâ€“Regangan secara langsung, fenomena penyempitan setempat (necking) hingga patah spesimen, serta ekstraksi sifat mekanis standar ASTM.',
        ja: 'ã‚ˆã†ã“ãï¼2Dè² è·ãƒ•ãƒ¬ãƒ¼ãƒ ã§å¼•å¼µï¼ˆASTM E8ï¼‰ãŠã‚ˆã³åœ§ç¸®ï¼ˆASTM E9ï¼‰è©¦é¨“ã‚’å†ç¾ã—ã€å¿œåŠ›-ã²ãšã¿ç·šå›³ã€ãƒãƒƒã‚­ãƒ³ã‚°ãƒ»ç ´æ–­ã€ASTMææ–™å®šæ•°ã®åŒå®šã‚’è¡Œã„ã¾ã™ã€‚',
      },
      tip: {
        en: 'Close the safety door on the load frame and run at 2xâ€“4x Sim Speed to watch elastic vs. plastic necking clearly.',
        id: 'Tutup pintu pengaman pada rangka beban dan jalankan pada Kecepatan Simulasi 2xâ€“4x agar transisi dari fase elastis hingga necking plastis terlihat jelas.',
        ja: 'è² è·ãƒ•ãƒ¬ãƒ¼ãƒ ã®å®‰å…¨æ‰‰ã‚’é–‰ã˜ã€2xã€œ4xã®å†ç”Ÿé€Ÿåº¦ã§å¼¾æ€§åŸŸã‹ã‚‰ãƒãƒƒã‚­ãƒ³ã‚°ãƒ»ç ´æ–­ã¾ã§ã®æŒ™å‹•ã‚’è¦³å¯Ÿã—ã¾ã—ã‚‡ã†ã€‚',
      },
    },
    {
      id: 'utm-specimen',
      badge: { en: 'Feature 1 Â· Mode & Material', id: 'Fitur 1 Â· Mode & Material', ja: 'æ©Ÿèƒ½1 Â· è©¦é¨“ãƒ¢ãƒ¼ãƒ‰ã¨ææ–™' },
      title: {
        en: 'Tensile / Compression & Specimen Material',
        id: 'Uji Tarik / Tekan & Material Spesimen',
        ja: 'å¼•å¼µ/åœ§ç¸®åˆ‡æ›¿ã¨è©¦é¨“ç‰‡ææ–™',
      },
      description: {
        en: 'Toggle between Tensile (ASTM E8) and Compression (ASTM E9), and choose a preset metal/polymer or "â˜… Custom Material Mode..." to enter custom E, Ïƒy, UTS, and %EL.',
        id: 'Beralihlah antara uji Tarik (ASTM E8) dan Tekan (ASTM E9), lalu pilih logam/polimer preset atau "â˜… Mode Material Kustom..." untuk memasukkan nilai E, Ïƒy, UTS, dan %EL secara mandiri.',
        ja: 'ã€Œå¼•å¼µ (ASTM E8)ã€ã¨ã€Œåœ§ç¸® (ASTM E9)ã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€æ¨™æº–ææ–™ã¾ãŸã¯ã€Œâ˜… ã‚«ã‚¹ã‚¿ãƒ ææ–™ãƒ¢ãƒ¼ãƒ‰...ã€ã§ Eãƒ»Ïƒyãƒ»UTSãƒ»%EL ã‚’è‡ªç”±ã«è¨­å®šã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="utm-specimen"]',
    },
    {
      id: 'utm-geometry',
      badge: { en: 'Feature 2 Â· Dimensions', id: 'Fitur 2 Â· Dimensi', ja: 'æ©Ÿèƒ½2 Â· è©¦é¨“ç‰‡å¯¸æ³•' },
      title: {
        en: 'Specimen Diameter Ã˜ & Gauge Length Lâ‚€',
        id: 'Diameter Spesimen Ã˜ & Panjang Ukur Lâ‚€',
        ja: 'è©¦é¨“ç‰‡ç›´å¾„ Ã˜ ã¨æ¨™ç‚¹é–“è·é›¢ Lâ‚€',
      },
      description: {
        en: 'Adjust Diameter Ã˜ (6.0â€“20.0 mm) and Gauge Length Lâ‚€ (25â€“100 mm). The badge updates cross-sectional area Aâ‚€ (mmÂ²), showing how geometry scales force F for the same stress Ïƒ.',
        id: 'Sesuaikan Diameter Ã˜ (6,0â€“20,0 mm) dan Panjang Ukur Lâ‚€ (25â€“100 mm). Indikator akan memperbarui luas penampang Aâ‚€ (mmÂ²) secara otomatis untuk menunjukkan pengaruh geometri terhadap gaya F pada tegangan Ïƒ yang sama.',
        ja: 'ç›´å¾„ Ã˜ï¼ˆ6.0ã€œ20.0 mmï¼‰ã¨æ¨™ç‚¹é–“è·é›¢ Lâ‚€ï¼ˆ25ã€œ100 mmï¼‰ã‚’è¨­å®šã™ã‚‹ã¨æ–­é¢ç© Aâ‚€ ãŒè‡ªå‹•è¨ˆç®—ã•ã‚Œã€åŒã˜å¿œåŠ›ã«å¯¾ã™ã‚‹è·é‡ F ã®é•ã„ã‚’ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="utm-geometry"]',
    },
    {
      id: 'utm-controls',
      badge: { en: 'Feature 3 Â· Speed & Run', id: 'Fitur 3 Â· Kecepatan & Pengujian', ja: 'æ©Ÿèƒ½3 Â· é€Ÿåº¦ã¨è©¦é¨“åˆ¶å¾¡' },
      title: {
        en: 'Crosshead Speed, Run, Mount & CSV',
        id: 'Kecepatan Crosshead, Mulai, Pasang & CSV',
        ja: 'ã‚¯ãƒ­ã‚¹ãƒ˜ãƒƒãƒ‰é€Ÿåº¦ãƒ»é–‹å§‹ãƒ»è£…å¡«ãƒ»CSV',
      },
      description: {
        en: 'Set Crosshead Speed (1â€“50 mm/min), click Start Test (or Pause/Restart), Mount a clean specimen (wrench), Reset to zero, or Export CSV test data.',
        id: 'Atur Kecepatan Crosshead (1â€“50 mm/menit), klik Mulai Uji (atau Jeda/Ulangi), Pasang spesimen baru (ikon kunci pas), Reset ke posisi nol, atau Ekspor data uji ke CSV.',
        ja: 'ã‚¯ãƒ­ã‚¹ãƒ˜ãƒƒãƒ‰é€Ÿåº¦ï¼ˆ1ã€œ50 mm/minï¼‰ã‚’è¨­å®šã—ã¦ã€Œè©¦é¨“é–‹å§‹ã€ã‚’æŠ¼ã—ã¾ã™ã€‚æ–°å“è©¦é¨“ç‰‡ã®è£…å¡«ã€ã‚¼ãƒ­ä½ç½®ãƒªã‚»ãƒƒãƒˆã€CSVãƒ‡ãƒ¼ã‚¿å‡ºåŠ›ã‚‚è¡Œãˆã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="utm-controls"]',
    },
    {
      id: 'utm-frame',
      badge: { en: 'Feature 4 Â· Load Frame', id: 'Fitur 4 Â· Rangka Beban', ja: 'æ©Ÿèƒ½4 Â· è² è·ãƒ•ãƒ¬ãƒ¼ãƒ ' },
      title: {
        en: 'Interactive UTM Load Frame & Safety Door',
        id: 'Rangka Beban UTM Interaktif & Pintu Pengaman',
        ja: 'å¯¾è©±åž‹UTMè² è·ãƒ•ãƒ¬ãƒ¼ãƒ ã¨å®‰å…¨æ‰‰',
      },
      description: {
        en: 'Operate the UTM directly on the 2D machine SVG: click the on-machine Start/Pause, E-Stop, and Reset buttons, toggle the safety door, or cycle "2x/4x/8x Sim Speed" at the top right.',
        id: 'Operasikan UTM langsung pada diagram SVG mesin 2D: klik tombol Start/Pause, E-Stop, dan Reset pada konsol mesin, buka/tutup pintu pengaman, atau ubah kecepatan simulasi ("Sim Speed" 2x/4x/8x) di pojok kanan atas.',
        ja: '2Dè©¦é¨“æ©ŸSVGä¸Šã®ã‚³ãƒ³ã‚½ãƒ¼ãƒ«ã§é–‹å§‹/ä¸€æ™‚åœæ­¢ãƒ»éžå¸¸åœæ­¢ãƒ»ãƒªã‚»ãƒƒãƒˆã‚„å®‰å…¨æ‰‰ã®é–‹é–‰ã‚’æ“ä½œã§ãã€å³ä¸Šã®ã€Œ2x/4x/8x Sim Speedã€ã‚‚åˆ‡ã‚Šæ›¿ãˆã‚‰ã‚Œã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="utm-frame"]',
    },
    {
      id: 'utm-telemetry',
      badge: { en: 'Feature 5 Â· Readouts', id: 'Fitur 5 Â· Pembacaan', ja: 'æ©Ÿèƒ½5 Â· ãƒ©ã‚¤ãƒ–è¨ˆæ¸¬å€¤' },
      title: {
        en: 'Live Load, Displacement, Stress & Strain',
        id: 'Pembacaan Gaya, Perpanjangan, Tegangan & Regangan Secara Langsung',
        ja: 'è·é‡ãƒ»å¤‰ä½ãƒ»å…¬ç§°å¿œåŠ›ãƒ»ã²ãšã¿ã‚«ãƒ¼ãƒ‰',
      },
      description: {
        en: 'Monitor instantaneous Force F (kN), Displacement Î”L (mm), Engineering Stress Ïƒ (MPa), and Engineering Strain Îµ (%) as the crosshead pulls or compresses the specimen.',
        id: 'Pantau Gaya F (kN), Perpanjangan Î”L (mm), Tegangan Teknik Ïƒ (MPa), dan Regangan Teknik Îµ (%) secara seketika saat crosshead menarik atau menekan spesimen.',
        ja: 'è©¦é¨“ä¸­ã®è·é‡ F (kN)ã€å¤‰ä½ Î”L (mm)ã€å…¬ç§°å¿œåŠ› Ïƒ (MPa)ã€å…¬ç§°ã²ãšã¿ Îµ (%) ã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã§è¿½è·¡ã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="utm-telemetry"]',
    },
    {
      id: 'utm-charts',
      badge: { en: 'Feature 6 Â· Live Chart', id: 'Fitur 6 Â· Grafik Langsung', ja: 'æ©Ÿèƒ½6 Â· ãƒ©ã‚¤ãƒ–ç·šå›³' },
      title: {
        en: 'Stressâ€“Strain & Forceâ€“Elongation Curve',
        id: 'Kurva Teganganâ€“Regangan & Gayaâ€“Perpanjangan',
        ja: 'å¿œåŠ›-ã²ãšã¿ï¼è·é‡-ä¼¸ã³ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ç·šå›³',
      },
      description: {
        en: 'Switch between Stressâ€“Strain and Forceâ€“Elongation plots to locate the proportional limit, 0.2% offset yield point, UTS peak, and fracture point.',
        id: 'Beralihlah antara grafik Teganganâ€“Regangan dan Gayaâ€“Perpanjangan untuk mengidentifikasi batas proporsional, titik luluh offset 0,2%, puncak UTS, dan titik patah.',
        ja: 'ã€ŒStressâ€“Strainã€ã¨ã€ŒForceâ€“Elongationã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€æ¯”ä¾‹é™åº¦ãƒ»0.2%è€åŠ›ãƒ»å¼•å¼µå¼·ã•ï¼ˆUTSï¼‰ãƒ»ç ´æ–­ç‚¹ã‚’è¦–è¦šçš„ã«ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="utm-charts"]',
    },
    {
      id: 'utm-results',
      badge: { en: 'Feature 7 Â· ASTM Matrix', id: 'Fitur 7 Â· Matriks ASTM', ja: 'æ©Ÿèƒ½7 Â· ASTMææ–™å®šæ•°' },
      title: {
        en: 'Extracted Material Properties (ASTM E8 / E9)',
        id: 'Ekstraksi Sifat Mekanis Material (ASTM E8 / E9)',
        ja: 'åŒå®šææ–™å®šæ•°ãƒžãƒˆãƒªãƒƒã‚¯ã‚¹',
      },
      description: {
        en: 'Inspect all 8 extracted properties: Modulus E, Yield Rp0.2, UTS/UCS, Peak Force Fmax, Elongation %EL, Reduction of Area %RA, Resilience Ur, and Toughness UT.',
        id: 'Periksa ke-8 sifat mekanis hasil ekstraksi: Modulus Elastisitas E, Tegangan Luluh Rp0,2, UTS/UCS, Gaya Maksimum Fmax, Perpanjangan %EL, Reduksi Penampang %RA, Resiliensi Ur, dan Ketangguhan UT.',
        ja: 'ãƒ¤ãƒ³ã‚°çŽ‡ Eãƒ»0.2%è€åŠ›ãƒ»UTS/UCSãƒ»æœ€å¤§è·é‡ãƒ»ç ´æ–­ä¼¸ã³ %ELãƒ»çµžã‚ŠçŽ‡ %RAãƒ»ãƒ¬ã‚¸ãƒªã‚¨ãƒ³ã‚¹ Urãƒ»ç ´å£Šã˜ã‚“æ€§ UT ã®8æŒ‡æ¨™ã‚’ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="utm-results"]',
    },
    {
      id: 'utm-estop',
      badge: { en: 'Feature 8 Â· Troubleshoot', id: 'Fitur 8 Â· Diagnosis Masalah', ja: 'æ©Ÿèƒ½8 Â· éžå¸¸åœæ­¢è¨ºæ–­' },
      title: {
        en: 'Emergency Stop & Safety Interlock Recovery',
        id: 'Penghenti Darurat (E-Stop) & Pemulihan Interlock Keselamatan',
        ja: 'éžå¸¸åœæ­¢ãƒœã‚¿ãƒ³ã¨å®‰å…¨ã‚¤ãƒ³ã‚¿ãƒ¼ãƒ­ãƒƒã‚¯è§£é™¤',
      },
      description: {
        en: 'Click the red Emergency Stop button to cut crosshead drive power and trigger the top interlock banner. Troubleshoot an unresponsive Start Test button by checking for the red E-Stop banner and clicking "Release E-Stop" (or ensuring a specimen is mounted).',
        id: 'Klik tombol merah Emergency Stop untuk memutus daya penggerak crosshead dan mengaktifkan panel interlock di bagian atas. Jika tombol Mulai Uji tidak aktif, periksa panel merah E-Stop dan klik "Lepas E-Stop" (atau pastikan spesimen baru telah terpasang).',
        ja: 'èµ¤ã„éžå¸¸åœæ­¢ãƒœã‚¿ãƒ³ã§é§†å‹•é›»æºã‚’é®æ–­ã—ã‚¤ãƒ³ã‚¿ãƒ¼ãƒ­ãƒƒã‚¯è­¦å ±ã‚’ãƒ†ã‚¹ãƒˆã§ãã¾ã™ã€‚ã€Œè©¦é¨“é–‹å§‹ã€ãŒæŠ¼ã›ãªã„å ´åˆã¯ä¸Šéƒ¨ã®éžå¸¸åœæ­¢ãƒãƒŠãƒ¼ã§ã€Œéžå¸¸åœæ­¢è§£é™¤ã€ã‚’ã‚¯ãƒªãƒƒã‚¯ã—ã¦å¾©å¸°ã•ã›ã¾ã—ã‚‡ã†ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'Why is the Start Test button disabled?',
            id: 'Mengapa tombol Mulai Uji tidak dapat ditekan (nonaktif)?',
            ja: 'ã€Œè©¦é¨“é–‹å§‹ã€ãƒœã‚¿ãƒ³ãŒæŠ¼ã›ãªã„ã®ã¯ãªãœã§ã™ã‹ï¼Ÿ',
          },
          a: {
            en: 'If Emergency Stop was triggered, click "Release E-Stop" on the red top banner. Also verify a clean specimen is mounted using the wrench button.',
            id: 'Apabila Emergency Stop aktif, klik "Lepas E-Stop" pada panel merah di bagian atas. Pastikan pula spesimen baru telah terpasang menggunakan tombol ikon kunci pas.',
            ja: 'éžå¸¸åœæ­¢ã‚¤ãƒ³ã‚¿ãƒ¼ãƒ­ãƒƒã‚¯ãŒä½œå‹•ã—ã¦ã„ã‚‹å ´åˆã¯ä¸Šéƒ¨èµ¤ãƒãƒŠãƒ¼ã®ã€Œéžå¸¸åœæ­¢è§£é™¤ã€ã‚’æŠ¼ã—ã¦ãã ã•ã„ã€‚ã¾ãŸã€ç ´æ–­å¾Œã¯æ–°å“è£…å¡«ãƒœã‚¿ãƒ³ã§è©¦é¨“ç‰‡ã‚’å†è£…å¡«ã—ã¦ãã ã•ã„ã€‚',
          },
          keywords: ['disabled', 'start', 'estop', 'emergency', 'interlock', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="utm-estop"]',
    },
    {
      id: 'utm-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice stressâ€“strain calculations, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan perhitungan kurva tegangan-regangan, dan Kuis.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€ææ–™è©¦é¨“ã®çŸ¥è­˜ã‚’ä»•ä¸Šã’ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'valve-packing': [
    {
      id: 'valve-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'Valve Stuffing Box & Stem Packing Lab',
        id: 'Lab Kotak Paking (Stuffing Box) & Paking Batang Katup',
        ja: 'ãƒãƒ«ãƒ–ã‚°ãƒ©ãƒ³ãƒ‰ãƒ‘ãƒƒã‚­ãƒ³ãƒ»ä¿å…¨ãƒ©ãƒœ',
      },
      description: {
        en: 'Welcome! This cutaway simulator models the trade-off between fugitive emissions sealing and stem friction in industrial valves. Letâ€™s walk through presets, controls, readouts, and fault diagnostics.',
        id: 'Selamat datang! Simulator penampang melintang ini memodelkan kompromi antara penyegelan kebocoran emisi proses (fugitive emissions) dan gesekan batang pada katup industri. Mari telusuri preset, kontrol, pembacaan, dan diagnostik gangguannya.',
        ja: 'ã‚ˆã†ã“ãï¼å·¥æ¥­ç”¨ãƒãƒ«ãƒ–ã®ã‚°ãƒ©ãƒ³ãƒ‰ãƒ‘ãƒƒã‚­ãƒ³ã«ãŠã‘ã‚‹æ¼æ´©é˜²æ­¢ã¨ã‚¹ãƒ†ãƒ æ‘©æ“¦ã®ãƒˆãƒ¬ãƒ¼ãƒ‰ã‚ªãƒ•ã‚’æ–­é¢å›³ã§å†ç¾ã—ã¾ã™ã€‚ãƒ—ãƒªã‚»ãƒƒãƒˆã€æ“ä½œã€è¨ˆæ¸¬å€¤ã€æ•…éšœè¨ºæ–­ã‚’é †ã«ç¢ºèªã—ã¾ã—ã‚‡ã†ã€‚',
      },
      tip: {
        en: 'Over-tightening gland nuts stops leaks but causes stem binding, actuator hunting, and stem scoring.',
        id: 'Mengencangkan mur penekan (gland nut) secara berlebihan memang menghentikan kebocoran, tetapi memicu kemacetan batang katup, osilasi aktuator (hunting), dan keausan gores pada batang.',
        ja: 'ã‚°ãƒ©ãƒ³ãƒ‰ãƒŠãƒƒãƒˆã®ç· ã‚éŽãŽã¯æ¼æ´©ã‚’æ­¢ã‚ã¾ã™ãŒã€ã‚¹ãƒ†ãƒ å›ºç€ã‚„ãƒãƒ³ãƒãƒ³ã‚°ã€ã‹ã˜ã‚Šã®åŽŸå› ã«ãªã‚Šã¾ã™ã€‚',
      },
    },
    {
      id: 'valve-presets',
      badge: { en: 'Feature 1 Â· Scenarios', id: 'Fitur 1 Â· Skenario', ja: 'æ©Ÿèƒ½1 Â· ã‚·ãƒŠãƒªã‚ª' },
      title: {
        en: 'Quick Scenario Presets & Reset',
        id: 'Preset Skenario Cepat & Reset',
        ja: 'ã‚·ãƒŠãƒªã‚ªãƒ—ãƒªã‚»ãƒƒãƒˆã¨ãƒªã‚»ãƒƒãƒˆ',
      },
      description: {
        en: 'Use the top Scenarios bar to jump between Optimal Seal, Fugitive Leak, Stem Binding, Passing Seat / Trap, and Worn Packing, or click Reset to return to the baseline optimal control valve.',
        id: 'Gunakan bilah Skenario di bagian atas untuk beralih antara Segel Optimal, Kebocoran Emisi Proses, Batang Katup Macet, Kebocoran Dudukan / Steam Trap, dan Paking Aus, atau klik Reset untuk kembali ke kondisi katup kontrol optimal awal.',
        ja: 'ä¸Šéƒ¨ã®ã‚·ãƒŠãƒªã‚ªãƒœã‚¿ãƒ³ã§ã€Œæœ€é©ã‚·ãƒ¼ãƒ«ã€ã€Œã‚°ãƒ©ãƒ³ãƒ‰æ¼æ´©ã€ã€Œã‚¹ãƒ†ãƒ å›ºç€ã€ã€Œã‚·ãƒ¼ãƒˆãƒ»ãƒˆãƒ©ãƒƒãƒ—æ¼ã‚Œã€ã€Œãƒ‘ãƒƒã‚­ãƒ³æ‘©è€—ã€ã‚’ãƒ¯ãƒ³ã‚¯ãƒªãƒƒã‚¯ã§å†ç¾ã§ãã€ãƒªã‚»ãƒƒãƒˆã§åˆæœŸçŠ¶æ…‹ã«æˆ»ã›ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="valve-presets"]',
    },
    {
      id: 'valve-canvas',
      badge: { en: 'Feature 2 Â· Cutaway SVG', id: 'Fitur 2 Â· Penampang SVG', ja: 'æ©Ÿèƒ½2 Â· æ–­é¢ã‚¢ãƒ‹ãƒ¡ãƒ¼ã‚·ãƒ§ãƒ³' },
      title: {
        en: 'Interactive Valve & Stuffing Box Cutaway',
        id: 'Penampang Melintang Katup & Stuffing Box Interaktif',
        ja: 'ãƒãƒ«ãƒ–ï¼†ã‚¹ã‚¿ãƒ•ã‚£ãƒ³ã‚°ãƒœãƒƒã‚¯ã‚¹æ–­é¢å›³',
      },
      description: {
        en: 'Inspect the live cross-section showing gland follower compression, braided packing rings, stem movement, fugitive leak plumes, and downstream seat/trap blow-by.',
        id: 'Amati penampang melintang secara langsung yang menampilkan penekanan gland follower, susunan cincin paking anyam, pergerakan batang katup, kepulan kebocoran emisi proses, serta aliran bocor (blow-by) pada dudukan/steam trap.',
        ja: 'ã‚°ãƒ©ãƒ³ãƒ‰ãƒ•ã‚©ãƒ­ã‚¢ã®åœ§ç¸®ã€ç·¨çµ„ãƒ‘ãƒƒã‚­ãƒ³ãƒªãƒ³ã‚°ã€ã‚¹ãƒ†ãƒ ä¸Šä¸‹å‹•ã€æ¼æ´©ã‚¬ã‚¹ã€ä¸‹æµã‚·ãƒ¼ãƒˆãƒ»ãƒˆãƒ©ãƒƒãƒ—ã®å¹ãæŠœã‘ã‚’æ–­é¢å›³ã§è¦³å¯Ÿã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="valve-canvas"]',
    },
    {
      id: 'valve-controls',
      badge: { en: 'Feature 3 Â· Valve & Gland', id: 'Fitur 3 Â· Katup & Gland', ja: 'æ©Ÿèƒ½3 Â· å¼ã¨ç· ä»˜æ“ä½œ' },
      title: {
        en: 'Valve Type, Fluid Service, Gland Torque & Wear',
        id: 'Jenis Katup, Layanan Fluida, Torsi Gland & Keausan',
        ja: 'ãƒãƒ«ãƒ–å½¢å¼ãƒ»æµä½“ãƒ»ç· ä»˜ãƒˆãƒ«ã‚¯ãƒ»æ‘©è€—',
      },
      description: {
        en: 'Select Valve Type and Fluid Service, then adjust Valve Opening (0â€“100%), Line Pressure (1â€“25 bar), Gland Follower Nut Torque (5â€“80 NÂ·m), and Packing Ring Wear Cycles (0â€“100k).',
        id: 'Pilih Jenis Katup dan Layanan Fluida, lalu atur Bukaan Katup (0â€“100%), Tekanan Saluran (1â€“25 bar), Torsi Mur Penekan Gland (5â€“80 NÂ·m), dan Siklus Keausan Paking (0â€“100 ribu siklus).',
        ja: 'ãƒãƒ«ãƒ–å½¢å¼ã¨å¯¾è±¡æµä½“ã‚’é¸ã³ã€é–‹åº¦ãƒ»ãƒ©ã‚¤ãƒ³åœ§åŠ›ãƒ»ã‚°ãƒ©ãƒ³ãƒ‰ãƒŠãƒƒãƒˆç· ä»˜ãƒˆãƒ«ã‚¯ãƒ»ãƒ‘ãƒƒã‚­ãƒ³æ‘©è€—å›žæ•°ã‚’èª¿æ•´ã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="valve-controls"]',
    },
    {
      id: 'valve-readouts',
      badge: { en: 'Feature 4 Â· Live Readouts', id: 'Fitur 4 Â· Pembacaan Langsung', ja: 'æ©Ÿèƒ½4 Â· ãƒ©ã‚¤ãƒ–è¨ˆæ¸¬å€¤' },
      title: {
        en: 'Flow, Stem Friction, EPA M21 & Seat Leak Cards',
        id: 'Kartu Aliran, Gesekan Batang, EPA M21 & Kebocoran Dudukan',
        ja: 'æµé‡ãƒ»æ‘©æ“¦ãƒ»EPA M21æ¼æ´©ãƒ»ã‚·ãƒ¼ãƒˆæ¼ã‚Œã‚«ãƒ¼ãƒ‰',
      },
      description: {
        en: 'Monitor Flow Rate (Q), Stem Friction (N) & Gland Force, Packing Leak (mL/min & EPA M21 ppm), and Seat Leakage (L/h) with Steam Trap cycle status.',
        id: 'Pantau Laju Aliran (Q), Gesekan Batang (N) & Gaya Tekan Gland, Kebocoran Paking (mL/menit & EPA M21 ppm), serta Kebocoran Dudukan (L/jam) beserta status siklus Steam Trap.',
        ja: 'æµé‡ Qã€ã‚¹ãƒ†ãƒ æ‘©æ“¦åŠ›ãƒ»æŠ¼ä»˜åŠ›ã€ãƒ‘ãƒƒã‚­ãƒ³æ¼æ´©é‡ï¼ˆEPA M21 ppmï¼‰ã€ã‚·ãƒ¼ãƒˆæ¼ã‚Œï¼ˆL/hï¼‰ã¨ãƒˆãƒ©ãƒƒãƒ—ä½œå‹•çŠ¶æ…‹ã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã§ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="valve-readouts"]',
    },
    {
      id: 'valve-diagnostics',
      badge: { en: 'Feature 5 Â· Flow & Friction Curves', id: 'Fitur 5 Â· Kurva Diagnostik', ja: 'æ©Ÿèƒ½5 Â· ç‰¹æ€§æ›²ç·šãƒ‘ãƒãƒ«' },
      title: {
        en: 'Inherent Cv Curve & Torque-vs-Leakage Window',
        id: 'Kurva Karakteristik Cv & Rentang Operasi Torsi vs Kebocoran',
        ja: 'å›ºæœ‰Cvç‰¹æ€§æ›²ç·šã¨ãƒˆãƒ«ã‚¯ãƒ»æ¼æ´©æœ€é©åŸŸ',
      },
      description: {
        en: 'Examine the Inherent Valve Flow Characteristic Curve alongside the Gland Torque operating window to keep fugitive emissions below 500 ppm EPA M21 without binding the stem.',
        id: 'Periksa Kurva Karakteristik Aliran Bawaan Katup beserta rentang operasi Torsi Gland untuk menjaga kebocoran emisi proses tetap di bawah ambang 500 ppm EPA M21 tanpa menyebabkan batang katup macet.',
        ja: 'å›ºæœ‰æµé‡ç‰¹æ€§æ›²ç·šã¨ã‚°ãƒ©ãƒ³ãƒ‰ãƒˆãƒ«ã‚¯æœ€é©åŸŸã‚’ç¢ºèªã—ã€EPA M21ï¼ˆ500 ppmä»¥ä¸‹ï¼‰ã‚’æº€ãŸã—ã¤ã¤ã‚¹ãƒ†ãƒ å›ºç€ã‚’é¿ã‘ã‚‹ç· ä»˜ç¯„å›²ã‚’è¦‹æ¥µã‚ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="valve-diagnostics"]',
    },
    {
      id: 'valve-faults',
      badge: { en: 'Feature 6 Â· Troubleshoot', id: 'Fitur 6 Â· Diagnosis Masalah', ja: 'æ©Ÿèƒ½6 Â· æ•…éšœæ³¨å…¥è¨ºæ–­' },
      title: {
        en: 'Steam Trap / Seat Fault Injection & Troubleshooting',
        id: 'Simulasi Gangguan & Penanganan Masalah Steam Trap / Dudukan',
        ja: 'ãƒˆãƒ©ãƒƒãƒ—ãƒ»ã‚·ãƒ¼ãƒˆæ•…éšœæ³¨å…¥ã¨ãƒˆãƒ©ãƒ–ãƒ«ã‚·ãƒ¥ãƒ¼ãƒ†ã‚£ãƒ³ã‚°',
      },
      description: {
        en: 'Use the Steam Trap / Seat Fault Injection dropdown to inject Under-Tightened Packing Leak, Over-Tightened Stem Binding, or Passing Seat / Blowing Steam Trap. Troubleshoot by reading the Maintenance Status banner and tuning Gland Torque (or replacing worn packing/seat) until status returns green.',
        id: 'Gunakan daftar pilihan Simulasi Gangguan Steam Trap / Dudukan untuk menguji kondisi Paking Kurang Kencang, Batang Macet Akibat Terlalu Kencang, atau Dudukan / Steam Trap Bocor. Lakukan diagnosis masalah dengan membaca panel Status Pemeliharaan dan menyetel ulang Torsi Gland (atau mengganti paking/dudukan yang aus) hingga indikator kembali hijau.',
        ja: 'ã€Œãƒˆãƒ©ãƒƒãƒ—ãƒ»ã‚·ãƒ¼ãƒˆæ•…éšœæ³¨å…¥ã€ã§ç· ä»˜ä¸è¶³ãƒ»éŽç· ä»˜å›ºç€ãƒ»ã‚·ãƒ¼ãƒˆæ¼ã‚Œ/ãƒˆãƒ©ãƒƒãƒ—å¹ãæŠœã‘ã‚’ç™ºç”Ÿã•ã›ã€ä¿å…¨ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹ãƒãƒŠãƒ¼ã‚’ç¢ºèªã—ãªãŒã‚‰ã‚°ãƒ©ãƒ³ãƒ‰ãƒˆãƒ«ã‚¯èª¿æ•´ã‚„ä¿®ç†æ–¹é‡ã‚’åˆ¤æ–­ã—ã¾ã—ã‚‡ã†ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'Why does tightening the gland not fix Seat Leakage?',
            id: 'Mengapa mengencangkan mur gland tidak menghentikan Kebocoran Dudukan Katup?',
            ja: 'ã‚°ãƒ©ãƒ³ãƒ‰ã‚’ç· ã‚ã¦ã‚‚ã‚·ãƒ¼ãƒˆæ¼ã‚ŒãŒæ­¢ã¾ã‚‰ãªã„ã®ã¯ãªãœã§ã™ã‹ï¼Ÿ',
          },
          a: {
            en: 'Gland packing only seals around the moving stem against atmosphere. Downstream seat leakage is caused by eroded valve trim/seat or a blowing steam trap and requires seat lapping or trap repair.',
            id: 'Paking gland hanya menyegel celah di sekitar batang katup terhadap atmosfer. Kebocoran dudukan di sisi hilir disebabkan oleh erosi pada trim/dudukan katup atau steam trap yang bocor terus-menerus, sehingga memerlukan pengasahan (lapping) dudukan atau perbaikan trap.',
            ja: 'ã‚°ãƒ©ãƒ³ãƒ‰ãƒ‘ãƒƒã‚­ãƒ³ã¯ã‚¹ãƒ†ãƒ å¤–å‘¨ã®å¤§æ°—å´æ¼æ´©ã®ã¿ã‚’æ­¢ã‚ã¾ã™ã€‚ã‚·ãƒ¼ãƒˆæ¼ã‚Œã¯å¼ä½“ãƒ»ã‚·ãƒ¼ãƒˆã®æå‚·ã‚„ãƒˆãƒ©ãƒƒãƒ—æ•…éšœãŒåŽŸå› ã®ãŸã‚ã€ã‚·ãƒ¼ãƒˆã™ã‚Šåˆã‚ã›ã‚„ãƒˆãƒ©ãƒƒãƒ—äº¤æ›ãŒå¿…è¦ã§ã™ã€‚',
          },
          keywords: ['seat', 'leakage', 'gland', 'trap', 'packing', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="valve-faults"]',
    },
    {
      id: 'valve-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice gland torque & EPA M21 exercises, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan penyetelan torsi gland & EPA M21, serta Kuis.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€ãƒ‘ãƒƒã‚­ãƒ³ä¿å…¨ã¨ãƒˆãƒ©ãƒƒãƒ—è¨ºæ–­ã‚’ç¿’å¾—ã—ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'vbelt-basics': [
    {
      id: 'vbelt-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'V-Belt Cross-Section & Wedging Physics',
        id: 'Penampang Sabuk-V (V-Belt) & Fisika Efek Baji',
        ja: 'Vãƒ™ãƒ«ãƒˆæ–­é¢ç€åº§ã¨ãã•ã³åŠ›å­¦',
      },
      description: {
        en: 'Welcome! Inspect proportional belt cross-sections seated inside a pulley groove on the 2D CAD view, compare sidewall wedging forces against flat/positive belts, and decode industrial belt codes.',
        id: 'Selamat datang! Amati penampang sabuk yang proporsional di dalam alur puli pada tampilan CAD 2D, bandingkan gaya efek baji pada dinding alur terhadap sabuk datar/positif, serta uraikan kode standar sabuk industri.',
        ja: 'ã‚ˆã†ã“ãï¼2D CADå›³ã§ãƒ—ãƒ¼ãƒªæºã«ç€åº§ã—ãŸãƒ™ãƒ«ãƒˆæ–­é¢ã®å®Ÿå¯¸æ¯”ã‚’ç¢ºèªã—ã€å´å£ãã•ã³åŠ¹æžœã‚„è¦æ ¼ã‚³ãƒ¼ãƒ‰è§£èª­å™¨ã‚’å¯¾è©±çš„ã«å­¦ç¿’ã—ã¾ã™ã€‚',
      },
      tip: {
        en: 'A V-belt should ride on the groove sidewallsâ€”never touch the bottom of the pulley groove.',
        id: 'Sabuk-V (V-belt) harus bertumpu pada kedua dinding samping alur dan tidak boleh menyentuh dasar alur puli.',
        ja: 'Vãƒ™ãƒ«ãƒˆã¯ãƒ—ãƒ¼ãƒªæºã®å´å£ã§æ‘©æ“¦ä¼é”ã™ã‚‹ãŸã‚ã€æºã®åº•é¢ã«æŽ¥è§¦ã—ã¦ã¯ã„ã‘ã¾ã›ã‚“ã€‚',
      },
    },
    {
      id: 'vbelt-profiles',
      badge: { en: 'Feature 1 Â· Belt Profiles', id: 'Fitur 1 Â· Profil Sabuk', ja: 'æ©Ÿèƒ½1 Â· ãƒ™ãƒ«ãƒˆå½¢å¼' },
      title: {
        en: 'Selecting Belt Profiles & Groove Angles',
        id: 'Memilih Profil Sabuk & Sudut Alur',
        ja: 'ãƒ™ãƒ«ãƒˆæ–­é¢å½¢å¼ã¨æºè§’åº¦ã®é¸æŠž',
      },
      description: {
        en: 'Click any profile button in the Select Belt Profile grid (classical, narrow wedge, cogged, or positive/flat profiles). The groove angle badge updates and loads a matching sample code into the decoder.',
        id: 'Klik tombol profil mana saja pada daftar Pilih Profil Sabuk (klasik, baji sempit/narrow wedge, bergerigi, atau positif/datar). Indikator sudut alur akan diperbarui otomatis sekaligus memuat contoh kode yang sesuai ke dalam dekoder.',
        ja: 'ã€Œãƒ™ãƒ«ãƒˆæ–­é¢å½¢å¼ã®é¸æŠžã€ã‚°ãƒªãƒƒãƒ‰ã‹ã‚‰ä»»æ„ã®å½¢å¼ã‚’é¸ã¶ã¨ã€ãƒ—ãƒ¼ãƒªæºã®ãã•ã³è§’åº¦ãŒæ›´æ–°ã•ã‚Œã€è¦æ ¼ã‚³ãƒ¼ãƒ‰è§£èª­å™¨ã«ã‚‚ä»£è¡¨ã‚³ãƒ¼ãƒ‰ãŒè‡ªå‹•å…¥åŠ›ã•ã‚Œã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vbelt-profiles"]',
    },
    {
      id: 'vbelt-tension',
      badge: { en: 'Feature 2 Â· Tension & RPM', id: 'Fitur 2 Â· Tegangan & RPM', ja: 'æ©Ÿèƒ½2 Â· å¼µåŠ›ã¨å›žè»¢æ•°' },
      title: {
        en: 'Belt Tension (T) & Driver RPM',
        id: 'Tegangan Sabuk (T) & Putaran Penggerak (RPM)',
        ja: 'ãƒ™ãƒ«ãƒˆå¼µåŠ› (T) ã¨é§†å‹•å›žè»¢æ•°',
      },
      description: {
        en: 'Drag Tension (T) from 100 to 1500 N and Driver RPM from 300 to 3600 rpm to observe how belt tension amplifies normal flank force Fn and how RPM affects linear belt speed V (m/s).',
        id: 'Atur Tegangan (T) dari 100 hingga 1500 N dan Putaran Penggerak dari 300 hingga 3600 rpm untuk mengamati bagaimana tegangan sabuk memperbesar gaya normal dinding alur Fn serta pengaruh RPM terhadap kecepatan linear sabuk V (m/s).',
        ja: 'å¼µåŠ› (T: 100ã€œ1500 N) ã¨é§†å‹•å›žè»¢æ•° (300ã€œ3600 rpm) ã‚’å‹•ã‹ã—ã€å´å£æŠ—åŠ› Fn ã®å¢—å¤§ã¨ãƒ™ãƒ«ãƒˆå‘¨é€Ÿåº¦ Vï¼ˆm/sï¼‰ã®å¤‰åŒ–ã‚’ç¢ºèªã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vbelt-tension"]',
    },
    {
      id: 'vbelt-decoder',
      badge: { en: 'Feature 3 Â· Code Decoder', id: 'Fitur 3 Â· Dekoder Kode', ja: 'æ©Ÿèƒ½3 Â· ã‚³ãƒ¼ãƒ‰è§£èª­å™¨' },
      title: {
        en: 'Interactive Belt Code Decoder',
        id: 'Dekoder Kode Sabuk Industri Interaktif',
        ja: 'ãƒ™ãƒ«ãƒˆè¦æ ¼ã‚³ãƒ¼ãƒ‰è§£èª­å™¨',
      },
      description: {
        en: 'Type an industrial belt designation (or click quick samples: B-65, SPA-1250, HTD 8M-800, AX-42, 6PK-1840) to parse family, cross-section, and effective length in mmâ€”click "Load" to apply it to the CAD view.',
        id: 'Ketik kode spesifikasi sabuk industri (atau klik contoh cepat: B-65, SPA-1250, HTD 8M-800, AX-42, 6PK-1840) untuk menguraikan jenis keluarga, penampang, dan panjang efektif dalam mmâ€”lalu klik "Muat" untuk menerapkannya pada tampilan CAD.',
        ja: 'è¦æ ¼ã‚³ãƒ¼ãƒ‰ã‚’å…¥åŠ›ï¼ˆã¾ãŸã¯ã‚µãƒ³ãƒ—ãƒ«ãƒœã‚¿ãƒ³ã‚’ã‚¯ãƒªãƒƒã‚¯ï¼‰ã™ã‚‹ã¨ã€ãƒ™ãƒ«ãƒˆç³»åˆ—ãƒ»æ–­é¢å¯¸æ³•ãƒ»æœ‰åŠ¹é•·ã•ï¼ˆmmï¼‰ã‚’è§£æžã—ã¾ã™ã€‚ã€Œé©ç”¨ã€ã§æ–­é¢å›³ã«åæ˜ ã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vbelt-decoder"]',
    },
    {
      id: 'vbelt-canvas',
      badge: { en: 'Feature 4 Â· CAD Cross-Section', id: 'Fitur 4 Â· Penampang CAD', ja: 'æ©Ÿèƒ½4 Â· CADæ–­é¢å›³' },
      title: {
        en: 'Proportional Belt & Pulley Groove SVG',
        id: 'Diagram SVG Penampang Sabuk & Alur Puli Proporsional',
        ja: 'å®Ÿå¯¸æ¯”ãƒ™ãƒ«ãƒˆãƒ»ãƒ—ãƒ¼ãƒªæºæ–­é¢å›³',
      },
      description: {
        en: 'Inspect the tensile cord layer, sidewall contact vectors, groove clearance at the bottom, and exact dimensional proportions of the active belt profile.',
        id: 'Amati lapisan kord penguat tarik, vektor gaya kontak dinding samping, celah bebas dasar alur, dan proporsi dimensi aktual dari profil sabuk yang sedang aktif.',
        ja: 'æŠ—å¼µä½“ã‚³ãƒ¼ãƒ‰å±¤ã€å´å£æŽ¥è§¦ååŠ›ãƒ™ã‚¯ãƒˆãƒ«ã€æºåº•ã®ã‚¯ãƒªã‚¢ãƒ©ãƒ³ã‚¹ã€é¸æŠžä¸­ãƒ™ãƒ«ãƒˆã®å®Ÿå¯¸æ¯”ãƒ—ãƒ­ãƒãƒ¼ã‚·ãƒ§ãƒ³ã‚’ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vbelt-canvas"]',
    },
    {
      id: 'vbelt-readouts',
      badge: { en: 'Feature 5 Â· Physics Strip', id: 'Fitur 5 Â· Kartu Fisika', ja: 'æ©Ÿèƒ½5 Â· ç‰©ç†é‡ã‚«ãƒ¼ãƒ‰' },
      title: {
        en: 'Live Belt Physics Readout Strip',
        id: 'Panel Pembacaan Fisika Sabuk Secara Langsung',
        ja: 'ãƒ©ã‚¤ãƒ–ãƒ™ãƒ«ãƒˆç‰©ç†é‡ã‚«ãƒ¼ãƒ‰',
      },
      description: {
        en: 'Monitor Flank Force Fn (N), Apparent Grip Î¼â€², Min Pulley D (mm), and Power / Strand (kW) as you tune belt profiles, tension, and speed.',
        id: 'Pantau Gaya Samping Fn (N), Koefisien Gesek Semu Î¼â€², Diameter Puli Minimum D (mm), dan Daya per Jalur (kW) saat Anda menyetel profil sabuk, tegangan, dan kecepatan putar.',
        ja: 'å´å£æŠ—åŠ› Fn (N)ã€è¦‹ã‹ã‘æ‘©æ“¦ Î¼â€²ã€æœ€å°ãƒ—ãƒ¼ãƒªå¾„ (mm)ã€ä¼å‹•å®¹é‡/æœ¬ (kW) ã®å¤‰åŒ–ã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã§æ¯”è¼ƒã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vbelt-readouts"]',
    },
    {
      id: 'vbelt-groove',
      badge: { en: 'Feature 6 Â· Troubleshoot', id: 'Fitur 6 Â· Gangguan Alur', ja: 'æ©Ÿèƒ½6 Â· ç€åº§ç•°å¸¸è¨ºæ–­' },
      title: {
        en: 'Groove Seating Faults: Worn Flanks & Bottomed-Out',
        id: 'Gangguan Kedudukan Alur: Dinding Aus & Dasar Mentok (Bottoming Out)',
        ja: 'ãƒ—ãƒ¼ãƒªæºç€åº§ç•°å¸¸ï¼šæ‘©è€—æºã¨åº•çªãæ•…éšœ',
      },
      description: {
        en: 'Toggle Groove Seating Health Condition between Proper Seating, Worn Flanks, and Bottomed-Out. When a belt bottoms out on the groove floor, sidewall wedging vanishes and Apparent Grip Î¼â€² turns redâ€”indicating the worn sheave must be replaced, not just over-tensioned.',
        id: 'Ubah Kondisi Kedudukan Alur Puli antara Duduk Baik, Alur Aus, dan Dasar Mentok (Bottomed-Out). Saat sabuk menyentuh dasar alur, efek baji dinding samping menghilang dan Gesekan Semu Î¼â€² berubah merahâ€”menandakan puli yang aus harus segera diganti, bukan sekadar mengencangkan sabuk.',
        ja: 'ã€Œãƒ—ãƒ¼ãƒªæºç€åº§çŠ¶æ…‹ã€ã‚’é©æ­£ç€åº§ãƒ»æ‘©è€—æºãƒ»åº•çªãæ•…éšœã§åˆ‡ã‚Šæ›¿ãˆã¾ã™ã€‚åº•çªãæ•…éšœã§ã¯å´å£ãã•ã³åŠ¹æžœãŒå¤±ã‚ã‚Œã¦è¦‹ã‹ã‘æ‘©æ“¦ Î¼â€² ãŒèµ¤è¡¨ç¤ºã¨ãªã‚Šã€å¼µã‚Šç›´ã—ã§ã¯ãªããƒ—ãƒ¼ãƒªäº¤æ›ãŒå¿…è¦ã¨åˆ¤æ–­ã§ãã¾ã™ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'Why does a bottomed-out V-belt slip even at high tension?',
            id: 'Mengapa V-belt yang menyentuh dasar alur (bottomed-out) tetap selip meskipun tegangannya tinggi?',
            ja: 'åº•çªãã—ãŸVãƒ™ãƒ«ãƒˆãŒå¼µåŠ›ã‚’ä¸Šã’ã¦ã‚‚æ»‘ã‚‹ã®ã¯ãªãœã§ã™ã‹ï¼Ÿ',
          },
          a: {
            en: 'Once the belt touches the groove floor, the wedge reaction on the angled sidewalls collapsesâ€”reducing apparent friction Î¼â€² back toward a flat belt (~0.30) instead of ~1.0+.',
            id: 'Begitu sabuk menyentuh dasar alur, gaya reaksi baji pada dinding miring alur menghilangâ€”menurunkan koefisien gesek semu Î¼â€² kembali ke tingkat sabuk datar (~0,30) alih-alih ~1,0+.',
            ja: 'ãƒ™ãƒ«ãƒˆãŒæºåº•ã«å½“ãŸã‚‹ã¨å´å£ã§ã®ãã•ã³ååŠ›ãŒå¤±ã‚ã‚Œã€è¦‹ã‹ã‘æ‘©æ“¦ Î¼â€² ãŒå¹³ãƒ™ãƒ«ãƒˆä¸¦ã¿ï¼ˆç´„0.30ï¼‰ã¾ã§æ€¥è½ã™ã‚‹ãŸã‚ã§ã™ã€‚',
          },
          keywords: ['bottomed', 'slip', 'worn', 'groove', 'friction', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="vbelt-groove"]',
    },
    {
      id: 'vbelt-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice wedging-force & belt-code problems, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal efek baji & kode sabuk, serta Kuis.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€Vãƒ™ãƒ«ãƒˆã®ç†è§£ã‚’æ·±ã‚ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'vibrating-feeder': [
    {
      id: 'vf-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'Vibrating Pan Feeder & Micro-Throwing Lab',
        id: 'Lab Pengumpan Getar (Vibrating Pan Feeder) & Micro-Throwing',
        ja: 'æŒ¯å‹•ãƒ‘ãƒ³ãƒ•ã‚£ãƒ¼ãƒ€ãƒ»ãƒžã‚¤ã‚¯ãƒ­æŠ•æ“²ãƒ©ãƒœ',
      },
      description: {
        en: 'Welcome! Model bulk conveying along an elastically isolated vibrating troughâ€”analyzing throw index Káµ¥, bed depth, mass flow rate, super-resonant isolation f/fâ‚™, and mechanical faults.',
        id: 'Selamat datang! Modelkan pengumpanan material curah di atas bak getar yang ditopang pegas isolasi elastisâ€”menganalisis indeks lempar Káµ¥, ketebalan lapisan material, laju aliran massa, isolasi super-resonan f/fâ‚™, serta gangguan mekanis.',
        ja: 'ã‚ˆã†ã“ãï¼é˜²æŒ¯ã°ã­æ”¯æŒã•ã‚ŒãŸæŒ¯å‹•ãƒˆãƒ©ãƒ•ä¸Šã®ç²‰ç²’ä½“æ¬é€ã‚’è§£æžã—ã€æŠ•æ“²æŒ‡æ•° Káµ¥ã€å±¤åŽšã€è³ªé‡æµé‡ã€è¶…å…±æŒ¯é˜²æŒ¯æ¯” f/fâ‚™ã€å„ç¨®æ•…éšœãƒ¢ãƒ¼ãƒ‰ã‚’å­¦ç¿’ã—ã¾ã™ã€‚',
      },
      tip: {
        en: 'Keep the frequency ratio f/fâ‚™ > 2.0 for super-resonant operation and >75% spring isolation.',
        id: 'Pertahankan rasio frekuensi f/fâ‚™ > 2,0 untuk operasi super-resonan dan efisiensi isolasi pegas >75%.',
        ja: 'å…±æŒ¯ã‚’é¿ã‘ã¦75%ä»¥ä¸Šã®é˜²æŒ¯åŠ¹çŽ‡ã‚’å¾—ã‚‹ãŸã‚ã€æŒ¯å‹•æ•°æ¯” f/fâ‚™ > 2.0 ã§é‹è»¢ã—ã¾ã—ã‚‡ã†ã€‚',
      },
    },
    {
      id: 'vf-presets',
      badge: { en: 'Feature 1 Â· Material Presets', id: 'Fitur 1 Â· Preset Material', ja: 'æ©Ÿèƒ½1 Â· æ¬é€ç‰©ãƒ—ãƒªã‚»ãƒƒãƒˆ' },
      title: {
        en: 'Material Presets & Playback Controls',
        id: 'Preset Material & Kontrol Operasi',
        ja: 'æ¬é€ç‰©ãƒ—ãƒªã‚»ãƒƒãƒˆã¨é‹è»¢åˆ¶å¾¡',
      },
      description: {
        en: 'Pick from five bulk material presets (Limestone, Coal, Iron Ore, Wet Sand, Wood Chips) to auto-load density, moisture friction, and throw angle, or use Pause/Run Feeder and Reset.',
        id: 'Pilih salah satu dari lima preset material curah (Batu Kapur, Batu Bara, Bijih Besi, Pasir Basah, Serpihan Kayu) untuk memuat densitas, koefisien gesek kadar air, dan sudut lempar secara otomatis, atau gunakan tombol Jeda/Jalankan dan Reset.',
        ja: '5ç¨®é¡žã®æ¬é€ç‰©ãƒ—ãƒªã‚»ãƒƒãƒˆï¼ˆçŸ³ç°çŸ³ãƒ»çŸ³ç‚­ãƒ»é‰„é‰±çŸ³ãƒ»æ¹¿ç ‚ãƒ»æœ¨è³ªãƒãƒƒãƒ—ï¼‰ã‹ã‚‰ç‰©æ€§ã¨æ¨™æº–è§’åº¦ã‚’è¨­å®šã§ãã€ä¸€æ™‚åœæ­¢/é‹è»¢å†é–‹ãŠã‚ˆã³ãƒªã‚»ãƒƒãƒˆãŒè¡Œãˆã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="feeder-presets"]',
    },
    {
      id: 'vf-canvas',
      badge: { en: 'Feature 2 Â· Cutaway & Gate', id: 'Fitur 2 Â· Penampang & Pintu Atur', ja: 'æ©Ÿèƒ½2 Â· æ–­é¢å›³ã¨ã‚²ãƒ¼ãƒˆ' },
      title: {
        en: 'Interactive Drag Gate, Scope & Throw Regime',
        id: 'Pintu Atur Geser Interaktif, Osiloskop & Rezim Lemparan',
        ja: 'ãƒ‰ãƒ©ãƒƒã‚°æ“ä½œã‚²ãƒ¼ãƒˆãƒ»æŒ¯å‹•æ³¢å½¢ã¨æŠ•æ“²ãƒ¢ãƒ¼ãƒ‰',
      },
      description: {
        en: 'Drag the hopper gate handle directly on the SVG canvas to change Gate Opening (H) and bed depth, watch the isolation springs and live vibration scope, and check the top-right Throw Regime pill.',
        id: 'Seret tuas pintu atur corong langsung pada diagram SVG untuk mengubah Bukaan Pintu (H) dan ketebalan lapisan material, amati pegas isolasi serta osiloskop getaran langsung, dan periksa indikator Rezim Lemparan di pojok kanan atas.',
        ja: 'SVGä¸Šã®ãƒ›ãƒƒãƒ‘ãƒ¼ã‚²ãƒ¼ãƒˆã‚’ç›´æŽ¥ãƒ‰ãƒ©ãƒƒã‚°ã—ã¦ã‚²ãƒ¼ãƒˆé–‹åº¦ (H) ã¨å±¤åŽšã‚’å¤‰æ›´ã—ã€é˜²æŒ¯ã°ã­ã‚„æŒ¯å‹•æ³¢å½¢ã€å³ä¸Šã®è¼¸é€ãƒ¢ãƒ¼ãƒ‰ãƒãƒƒã‚¸ã‚’ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="feeder-canvas"]',
    },
    {
      id: 'vf-drive',
      badge: { en: 'Feature 3 Â· Drive & Vibration', id: 'Fitur 3 Â· Penggerak & Getaran', ja: 'æ©Ÿèƒ½3 Â· åŠ æŒ¯ãƒ‘ãƒ©ãƒ¡ãƒ¼ã‚¿' },
      title: {
        en: 'Drive Frequency f, Stroke 2A & Throw Angle Î²',
        id: 'Frekuensi Penggerak f, Langkah (Stroke) 2A & Sudut Lempar Î²',
        ja: 'é§†å‹•å‘¨æ³¢æ•° fãƒ»æŒ¯å¹… 2Aãƒ»æŠ•æ“²è§’ Î²',
      },
      description: {
        en: 'Tune Drive Frequency f (8â€“55 Hz), Stroke 2A (1.5â€“14.0 mm), and Throw Angle Î² (10Â°â€“40Â°) in Group 1 to transition between sub-threshold sliding, optimal micro-throw, and aggressive bounce.',
        id: 'Atur Frekuensi Penggerak f (8â€“55 Hz), Langkah 2A (1,5â€“14,0 mm), dan Sudut Lempar Î² (10Â°â€“40Â°) pada Grup 1 untuk mengamati peralihan antara luncuran sub-ambang, micro-throw optimal, dan pantulan agresif.',
        ja: 'ã‚°ãƒ«ãƒ¼ãƒ—1ã§é§†å‹•å‘¨æ³¢æ•° fï¼ˆ8ã€œ55 Hzï¼‰ã€æŒ¯å¹… 2Aï¼ˆ1.5ã€œ14.0 mmï¼‰ã€æŠ•æ“²è§’ Î²ï¼ˆ10Â°ã€œ40Â°ï¼‰ã‚’èª¿æ•´ã—ã€æ»‘èµ°ãƒ»æœ€é©ãƒžã‚¤ã‚¯ãƒ­æŠ•æ“²ãƒ»éŽå¤§è·³èºã‚’åˆ‡ã‚Šæ›¿ãˆã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="feeder-drive"]',
    },
    {
      id: 'vf-trough',
      badge: { en: 'Feature 4 Â· Trough & Gate', id: 'Fitur 4 Â· Bak & Pintu Atur', ja: 'æ©Ÿèƒ½4 Â· ãƒˆãƒ©ãƒ•ãƒ»ã‚²ãƒ¼ãƒˆå½¢çŠ¶' },
      title: {
        en: 'Trough Width, Length, Gate H & Slope Î±',
        id: 'Lebar Bak, Panjang, Bukaan H & Kemiringan Î±',
        ja: 'ãƒˆãƒ©ãƒ•å¹…ãƒ»é•·ã•ãƒ»ã‚²ãƒ¼ãƒˆé–‹åº¦ãƒ»å‹¾é…',
      },
      description: {
        en: 'Adjust Trough Width W (300â€“1600 mm), Length L (1.5â€“6.0 m), Gate Opening H (40â€“300 mm), and Slope Î± (0Â°â€“15Â°) in Group 2 to size volumetric and mass throughput.',
        id: 'Atur Lebar Bak W (300â€“1600 mm), Panjang L (1,5â€“6,0 m), Bukaan Pintu H (40â€“300 mm), dan Kemiringan Î± (0Â°â€“15Â°) pada Grup 2 untuk menentukan kapasitas aliran volumetrik dan massa.',
        ja: 'ã‚°ãƒ«ãƒ¼ãƒ—2ã§ãƒˆãƒ©ãƒ•å¹… Wãƒ»é•·ã• Lãƒ»ã‚²ãƒ¼ãƒˆé–‹åº¦ Hãƒ»å‹¾é… Î±ï¼ˆ0Â°ã€œ15Â°ï¼‰ã‚’è¨­å®šã—ã€æ¬é€æ–­é¢ç©ã¨è³ªé‡æµé‡ã‚’èª¿æ•´ã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="feeder-trough"]',
    },
    {
      id: 'vf-springs',
      badge: { en: 'Feature 5 Â· Material & Springs', id: 'Fitur 5 Â· Material & Pegas', ja: 'æ©Ÿèƒ½5 Â· ç‰©æ€§ã¨é˜²æŒ¯ã°ã­' },
      title: {
        en: 'Density Ï, Moisture/Î¼ & Spring Stiffness k',
        id: 'Densitas Ï, Kadar Air/Gesekan & Kekakuan Pegas k',
        ja: 'ã‹ã•å¯†åº¦ Ïãƒ»æ°´åˆ†æ‘©æ“¦ãƒ»ã°ã­å®šæ•° k',
      },
      description: {
        en: 'Adjust Bulk Density Ï, Moisture/Friction factor, and Spring Stiffness k (300â€“1800 N/mm) in Group 3â€”note how spring stiffness shifts the natural frequency fâ‚™ shown in the header.',
        id: 'Sesuaikan Densitas Curah Ï, faktor Kadar Air/Gesekan, dan Kekakuan Pegas k (300â€“1800 N/mm) pada Grup 3â€”perhatikan bagaimana kekakuan pegas menggeser frekuensi alami fâ‚™ yang ditampilkan pada bagian atas.',
        ja: 'ã‚°ãƒ«ãƒ¼ãƒ—3ã§ã‹ã•å¯†åº¦ Ïã€æ°´åˆ†ãƒ»æ‘©æ“¦ä¿‚æ•°ã€ã°ã­å®šæ•° kï¼ˆ300ã€œ1800 N/mmï¼‰ã‚’èª¿æ•´ã—ã€å›ºæœ‰æŒ¯å‹•æ•° fâ‚™ ã®å¤‰åŒ–ã‚’ç¢ºèªã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="feeder-springs"]',
    },
    {
      id: 'vf-telemetry',
      badge: { en: 'Feature 6 Â· Telemetry', id: 'Fitur 6 Â· Telemetri', ja: 'æ©Ÿèƒ½6 Â· ãƒ†ãƒ¬ãƒ¡ãƒˆãƒª' },
      title: {
        en: 'Six Engineering KPIs & Resonance Guard',
        id: 'Enam Indikator Teknik & Pengaman Resonansi',
        ja: '6ã¤ã®å·¥å­¦KPIã¨å…±æŒ¯ç›£è¦–',
      },
      description: {
        en: 'Monitor Throw Index Káµ¥, Conveying Velocity & Bed Depth, Mass Flow Rate (t/h), Springs & f/fâ‚™ ratio, Motor Power/Current, and Liner Wear Index.',
        id: 'Pantau Indeks Lempar Káµ¥, Kecepatan Pengumpanan & Ketebalan Lapisan, Laju Aliran Massa (ton/jam), Pegas & rasio f/fâ‚™, Daya/Arus Motor, serta Indeks Keausan Pelapis (Liner).',
        ja: 'æŠ•æ“²æŒ‡æ•° Káµ¥ã€è¼¸é€é€Ÿåº¦ãƒ»å±¤åŽšã€è³ªé‡æµé‡ (t/h)ã€ã°ã­è·é‡ãƒ»f/fâ‚™ã€ãƒ¢ãƒ¼ã‚¿å‡ºåŠ›ãƒ»é›»æµã€ãƒ©ã‚¤ãƒŠãƒ¼æ‘©è€—æŒ‡æ•°ã®6ã‚«ãƒ¼ãƒ‰ã‚’ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="feeder-telemetry"]',
    },
    {
      id: 'vf-faults',
      badge: { en: 'Feature 7 Â· Troubleshoot', id: 'Fitur 7 Â· Diagnosis Masalah', ja: 'æ©Ÿèƒ½7 Â· æ•…éšœæ³¨å…¥è¨ºæ–­' },
      title: {
        en: 'Fault Injection Lab & Troubleshooting',
        id: 'Lab Simulasi Gangguan & Penanganan Masalah',
        ja: 'ç•°å¸¸ãƒ»æ•…éšœæ³¨å…¥ãƒ©ãƒœã¨å¾©æ—§è¨ºæ–­',
      },
      description: {
        en: 'Inject Broken Coil Spring, Hopper Bridging / Arching, or Dual Eccentric Phase Slip in the Fault Injection Lab. Inspect the Diagnostic & Fault Status Banner to identify the symptom (or Resonance Danger Zone), then click "Repair / Clear Fault" to restore normal operation.',
        id: 'Simulasikan Pegas Koil Patah, Penyumbatan Corong (Bridging), atau Slip Fasa Eksentrik Ganda pada Lab Simulasi Gangguan. Periksa Panel Status Diagnostik & Gangguan untuk mengenali gejala (atau Zona Bahaya Resonansi), lalu klik "Perbaiki Gangguan" guna memulihkan operasi normal.',
        ja: 'ã€Œç•°å¸¸ãƒ»æ•…éšœæ³¨å…¥ãƒ©ãƒœã€ã§ã‚³ã‚¤ãƒ«ã°ã­ç ´æãƒ»ãƒ›ãƒƒãƒ‘ãƒ¼ãƒ–ãƒªãƒƒã‚¸ãƒ»äºŒè»¸åå¿ƒä½ç›¸ãšã‚Œã‚’ç™ºç”Ÿã•ã›ã€è¨ºæ–­ãƒãƒŠãƒ¼ã§ç—‡çŠ¶ã‚’ç¢ºèªã—ãŸã‚ã¨ã€Œç•°å¸¸ã‚’ä¿®å¾©ã€ãƒœã‚¿ãƒ³ã§å¾©æ—§ã§ãã¾ã™ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'How do I escape the Resonance Danger Zone?',
            id: 'Bagaimana cara keluar dari Zona Bahaya Resonansi?',
            ja: 'å…±æŒ¯å±é™ºé ˜åŸŸï¼ˆResonance Danger Zoneï¼‰ã‹ã‚‰æŠœã‘ã‚‹ã«ã¯ï¼Ÿ',
          },
          a: {
            en: 'Increase Drive Frequency f or reduce Spring Stiffness k so the ratio f/fâ‚™ rises above 2.0, or click "Repair / Clear Fault" on the diagnostic banner.',
            id: 'Naikkan Frekuensi Penggerak f atau turunkan Kekakuan Pegas k sehingga rasio f/fâ‚™ melampaui 2,0, atau klik "Perbaiki Gangguan" pada panel diagnostik.',
            ja: 'é§†å‹•å‘¨æ³¢æ•° f ã‚’ä¸Šã’ã‚‹ã‹ã°ã­å®šæ•° k ã‚’ä¸‹ã’ã¦ f/fâ‚™ > 2.0 ã«ã™ã‚‹ã‹ã€è¨ºæ–­ãƒãƒŠãƒ¼ã®ã€Œç•°å¸¸ã‚’ä¿®å¾©ã€ã‚’ã‚¯ãƒªãƒƒã‚¯ã—ã¾ã™ã€‚',
          },
          keywords: ['resonance', 'danger', 'natural frequency', 'f/fn', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="feeder-faults"]',
    },
    {
      id: 'vf-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice throw-index & isolation exercises, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal indeks lempar & rasio isolasi, serta Kuis.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€æŒ¯å‹•ãƒ•ã‚£ãƒ¼ãƒ€ã®ç†è§£ã‚’ä»•ä¸Šã’ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  vibration: [
    {
      id: 'vib-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'Single-Plane Rotor Balancing & Resonance',
        id: 'Penyeimbangan Rotor Satu Bidang & Resonansi',
        ja: 'å˜ä¸€ä¿®æ­£é¢ãƒ­ãƒ¼ã‚¿å‹•é‡£åˆã¨å…±æŒ¯è§£æž',
      },
      description: {
        en: 'Welcome! Model a single-plane Jeffcott rotor with mass unbalance, critical speed resonance, phase lag shift, and ISO 10816-3 / 20816-3 severity limits.',
        id: 'Selamat datang! Modelkan rotor Jeffcott satu bidang dengan ketidakseimbangan (unbalance) massa, resonansi kecepatan kritis, pergeseran sudut fasa, serta batas tingkat keparahan getaran ISO 10816-3 / 20816-3.',
        ja: 'ã‚ˆã†ã“ãï¼å˜ä¸€ä¿®æ­£é¢ã‚¸ã‚§ãƒ•ã‚³ãƒƒãƒˆãƒ»ãƒ­ãƒ¼ã‚¿ã®ä¸é‡£åˆæŒ¯å‹•ã€å±é™ºé€Ÿåº¦å…±æŒ¯ã€ä½ç›¸é…ã‚Œå¤‰åŒ–ã€ISO 10816-3 / 20816-3 è©•ä¾¡ã‚’ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã—ã¾ã™ã€‚',
      },
      tip: {
        en: 'Place the correction mass Wc 180Â° opposite the heavy spot Î¸â‚€ to cancel net unbalance.',
        id: 'Pasang massa koreksi Wc tepat berlawanan 180Â° dari titik berat awal Î¸â‚€ untuk meniadakan ketidakseimbangan sisa.',
        ja: 'åˆæœŸä¸é‡£åˆã®ä½ç›¸ Î¸â‚€ ã«å¯¾ã—ã¦ 180Â° åå¯¾å´ã¸åŒç­‰ã®ä¿®æ­£é‡éŒ˜ Wc ã‚’é…ç½®ã™ã‚‹ã¨æ®‹ç•™ä¸é‡£åˆãŒã‚¼ãƒ­ã«ãªã‚Šã¾ã™ã€‚',
      },
    },
    {
      id: 'vib-scenario',
      badge: { en: 'Feature 1 Â· Presets & Support', id: 'Fitur 1 Â· Preset & Fondasi', ja: 'æ©Ÿèƒ½1 Â· åŸºç¤Žã¨ãƒ—ãƒªã‚»ãƒƒãƒˆ' },
      title: {
        en: 'Foundation Support & Unbalance Presets',
        id: 'Tipe Fondasi & Preset Ketidakseimbangan',
        ja: 'åŸºç¤Žæ”¯æŒå½¢å¼ã¨ä¸é‡£åˆãƒ—ãƒªã‚»ãƒƒãƒˆ',
      },
      description: {
        en: 'Toggle Rigid vs. Flexible (Class II) foundation supportâ€”which shifts ISO velocity thresholdsâ€”and choose a Rotor Unbalance Preset from the dropdown.',
        id: 'Beralihlah antara Tipe Fondasi Kaku dan Fleksibel (Kelas II)â€”yang menggeser ambang kecepatan getaran ISOâ€”serta pilih Preset Ketidakseimbangan Rotor dari daftar pilihan.',
        ja: 'å‰›æ€§åŸºç¤Žï¼å¼¾æ€§åŸºç¤Žï¼ˆClass IIï¼šISOåˆ¤å®šã—ãã„å€¤ãŒå¤‰åŒ–ï¼‰ã‚’åˆ‡ã‚Šæ›¿ãˆã€ãƒ­ãƒ¼ã‚¿ä¸é‡£åˆãƒ—ãƒªã‚»ãƒƒãƒˆã‚’é¸æŠžã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vibration-scenario"]',
    },
    {
      id: 'vib-speed',
      badge: { en: 'Feature 2 Â· Speed & Nc', id: 'Fitur 2 Â· Kecepatan & Nc', ja: 'æ©Ÿèƒ½2 Â· é‹è»¢å›žè»¢æ•°' },
      title: {
        en: 'Operating Speed Sweep & Critical Speed Nc',
        id: 'Sapuan Kecepatan Operasi & Kecepatan Kritis Nc',
        ja: 'é‹è»¢å›žè»¢é€Ÿåº¦ã‚¹ã‚¤ãƒ¼ãƒ—ã¨å±é™ºé€Ÿåº¦ Nc',
      },
      description: {
        en: 'Drag Operating Speed (300â€“4500 RPM) or click quick jump buttons (900, 1800, 2100 Nc, 3000, 3600) to sweep across the critical speed and watch amplitude peak and phase lag shift 90Â°â†’180Â°.',
        id: 'Atur Kecepatan Operasi (300â€“4500 RPM) atau klik tombol cepat (900, 1800, 2100 Nc, 3000, 3600) untuk melintasi kecepatan kritis serta mengamati puncak amplitudo dan pergeseran fasa 90Â°â†’180Â°.',
        ja: 'é‹è»¢å›žè»¢é€Ÿåº¦ï¼ˆ300ã€œ4500 RPMï¼‰ã‚„ã‚¯ã‚¤ãƒƒã‚¯ãƒœã‚¿ãƒ³ï¼ˆNcå¼·èª¿è¡¨ç¤ºï¼‰ã§å±é™ºé€Ÿåº¦é€šéŽæ™‚ã®æŒ¯å¹…ãƒ”ãƒ¼ã‚¯ã¨ä½ç›¸å¤‰åŒ–ã‚’è¦³å¯Ÿã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vibration-speed"]',
    },
    {
      id: 'vib-balancing',
      badge: { en: 'Feature 3 Â· Balancing', id: 'Fitur 3 Â· Penyeimbangan', ja: 'æ©Ÿèƒ½3 Â· é‡£åˆä¿®æ­£' },
      title: {
        en: 'Initial Unbalance Uâ‚€ & Correction Weight Wc',
        id: 'Ketidakseimbangan Awal Uâ‚€ & Massa Koreksi Wc',
        ja: 'åˆæœŸä¸é‡£åˆ Uâ‚€ ã¨é‡£åˆä¿®æ­£è³ªé‡ Wc',
      },
      description: {
        en: 'Adjust Initial Unbalance Uâ‚€ and Angle Î¸â‚€, then counter-balance manually using Added Mass Wc and Correction Angle Î¸c. Click "Auto-Balance" to apply the exact counter-weight, "Clear" to reset, or the sliders icon for Advanced Nc / Damping Î¶.',
        id: 'Sesuaikan Ketidakseimbangan Awal Uâ‚€ dan Sudut Î¸â‚€, lalu lakukan penyeimbangan manual menggunakan Massa Tambahan Wc dan Sudut Koreksi Î¸c. Klik "Balans Ideal" untuk menerapkan massa penyeimbang otomatis, "Hapus" untuk mengatur ulang, atau ikon penggeser untuk pengaturan lanjutan Nc / Redaman Î¶.',
        ja: 'åˆæœŸä¸é‡£åˆ Uâ‚€ãƒ»Î¸â‚€ ã‚’è¨­å®šã—ã€ä»˜åŠ è³ªé‡ Wcãƒ»Î¸c ã§æ‰‹å‹•é‡£åˆã‚’è¡Œã„ã¾ã™ã€‚ã€Œè‡ªå‹•é‡£åˆä¿®æ­£ã€ã€Œã‚¯ãƒªã‚¢ã€ã€ã•ã‚‰ã«è©³ç´°è¨­å®šãƒœã‚¿ãƒ³ã§ Nc ã¨æ¸›è¡°æ¯” Î¶ ã‚‚èª¿æ•´ã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vibration-balancing"]',
    },
    {
      id: 'vib-rig',
      badge: { en: 'Feature 4 Â· Rotor Rig SVG', id: 'Fitur 4 Â· Rig Rotor SVG', ja: 'æ©Ÿèƒ½4 Â· ãƒ­ãƒ¼ã‚¿è©¦é¨“ãƒ™ãƒ³ãƒ' },
      title: {
        en: 'Interactive Rotor Dynamic Rig & Face View',
        id: 'Rig Dinamika Rotor & Tampilan Muka Interaktif',
        ja: 'å¯¾è©±åž‹ãƒ­ãƒ¼ã‚¿å‹•é‡£åˆè©¦é¨“ãƒ™ãƒ³ãƒå›³',
      },
      description: {
        en: 'Click directly on the balancing disk PCD bolt holes in the SVG face view to mount Correction Angle Î¸c, or toggle the motor run state while watching the 1X orbit and phase lag arrow.',
        id: 'Klik langsung lubang baut PCD pada tampilan muka cakram SVG untuk memasang Sudut Koreksi Î¸c, atau nyalakan/matikan motor sambil mengamati orbit 1X dan panah pergeseran fasa.',
        ja: 'ãƒ™ãƒ³ãƒå›³ã®ãƒãƒ©ãƒ³ã‚¹ãƒ‡ã‚£ã‚¹ã‚¯PCDãƒœãƒ«ãƒˆç©´ã‚’ã‚¯ãƒªãƒƒã‚¯ã—ã¦ä¿®æ­£ä½ç›¸è§’ Î¸c ã‚’ç›´æ„Ÿçš„ã«æŒ‡å®šã§ãã€1Xè»Œé“ã‚„ä½ç›¸é…ã‚ŒçŸ¢å°ã‚’è¦³å¯Ÿã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vibration-rig"]',
    },
    {
      id: 'vib-telemetry',
      badge: { en: 'Feature 5 Â· Telemetry', id: 'Fitur 5 Â· Telemetri', ja: 'æ©Ÿèƒ½5 Â· ãƒ†ãƒ¬ãƒ¡ãƒˆãƒª' },
      title: {
        en: 'Live Vibration Telemetry Cards',
        id: 'Kartu Telemetri Getaran Langsung',
        ja: 'ãƒ©ã‚¤ãƒ–æŒ¯å‹•ãƒ†ãƒ¬ãƒ¡ãƒˆãƒªã‚«ãƒ¼ãƒ‰',
      },
      description: {
        en: 'Track Vibration RMS v_rms (mm/s), 1X Orbit Pk-Pk (Î¼m), Net Unbalance U_net (gÂ·mm), and Phase Lag Ï† (Â°).',
        id: 'Pantau Kecepatan Getaran RMS v_rms (mm/s), Orbit 1X Pk-Pk (Î¼m), Ketidakseimbangan Sisa U_net (gÂ·mm), dan Pergeseran Fasa Ï† (Â°).',
        ja: 'ç·æŒ¯å‹•é€Ÿåº¦ RMSãƒ»1XæŒ¯å¹…ãƒ»æ®‹ç•™ä¸é‡£åˆãƒ»ä½ç›¸é…ã‚Œè§’ Ï† ã®4æŒ‡æ¨™ã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã§ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vibration-telemetry"]',
    },
    {
      id: 'vib-charts',
      badge: { en: 'Feature 6 Â· FFT & Bode', id: 'Fitur 6 Â· FFT & Bode', ja: 'æ©Ÿèƒ½6 Â· FFTã¨ãƒœãƒ¼ãƒ‰ç·šå›³' },
      title: {
        en: 'FFT Spectrum & Bode Response Curve',
        id: 'Spektrum FFT & Kurva Respons Bode',
        ja: 'FFTã‚¹ãƒšã‚¯ãƒˆãƒ«ï¼†ãƒœãƒ¼ãƒ‰ç·šå›³',
      },
      description: {
        en: 'Switch between the FFT Spectrum tab (showing the dominant 1X synchronous peak) and the Bode Curve tab (amplitude & phase vs. RPM across critical speed Nc).',
        id: 'Beralihlah antara tab Spektrum FFT (menampilkan puncak sinkron 1X yang dominan) dan tab Kurva Bode (amplitudo & fasa terhadap RPM melintasi kecepatan kritis Nc).',
        ja: 'ã€ŒFFTã‚¹ãƒšã‚¯ãƒˆãƒ«ã€ï¼ˆ1XåŒæœŸæˆåˆ†ãƒ”ãƒ¼ã‚¯ï¼‰ã¨ã€Œãƒœãƒ¼ãƒ‰ç·šå›³ã€ï¼ˆå±é™ºé€Ÿåº¦Ncã‚’æŒŸã‚€æŒ¯å¹…ãƒ»ä½ç›¸ç‰¹æ€§ï¼‰ã‚’åˆ‡ã‚Šæ›¿ãˆã¦è§£æžã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vibration-charts"]',
    },
    {
      id: 'vib-iso',
      badge: { en: 'Feature 7 Â· Troubleshoot', id: 'Fitur 7 Â· Diagnostik ISO', ja: 'æ©Ÿèƒ½7 Â· ISOç•°å¸¸è¨ºæ–­' },
      title: {
        en: 'ISO 10816-3 / 20816-3 Severity & Troubleshooting',
        id: 'Tingkat Keparahan ISO 10816-3 / 20816-3 & Penanganan Masalah',
        ja: 'ISO 10816-3 / 20816-3 åˆ¤å®šã¨å¯¾ç­–',
      },
      description: {
        en: 'Watch the ISO Severity Card classify vibration into Zone A (Good), B (Satisfactory), C (Unsatisfactory), or D (Unacceptable Trip). If in Zone C/D, diagnose whether RPM is parked on Critical Speed Nc (move RPM away from Nc) or U_net is high (apply counter-weight Wc or click Auto-Balance).',
        id: 'Pantau kartu Tingkat Keparahan ISO yang mengklasifikasikan getaran ke dalam Zona A (Baik), B (Memuaskan), C (Tidak Memuaskan), atau D (Tidak Dapat Diterima / Trip). Jika berada di Zona C/D, periksa apakah RPM berada tepat pada Kecepatan Kritis Nc (jauhkan RPM dari Nc) atau nilai U_net masih tinggi (pasang massa koreksi Wc atau klik Balans Ideal).',
        ja: 'ISOåˆ¤å®šã‚«ãƒ¼ãƒ‰ã§æŒ¯å‹•çŠ¶æ…‹ã‚’ Zone Aã€œD ã«åˆ†é¡žã—ã¾ã™ã€‚Zone C/D ã«å…¥ã£ãŸå ´åˆã¯ã€å±é™ºé€Ÿåº¦ Nc ä»˜è¿‘ã§ã®é‹è»¢ã‹æ®‹ç•™ä¸é‡£åˆ U_net éŽå¤šã‹ã‚’åˆ‡ã‚Šåˆ†ã‘ã€å›žè»¢æ•°å¤‰æ›´ã‚„é‡£åˆä¿®æ­£ã§ Zone A ã¸æ”¹å–„ã—ã¾ã—ã‚‡ã†ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'Why does vibration spike at 2100 RPM even with small unbalance?',
            id: 'Mengapa getaran melonjak tajam pada 2100 RPM meskipun ketidakseimbangan massa kecil?',
            ja: 'ä¸é‡£åˆãŒå°ã•ãã¦ã‚‚2100 RPMã§æŒ¯å‹•ãŒæ€¥å¢—ã™ã‚‹ã®ã¯ãªãœï¼Ÿ',
          },
          a: {
            en: '2100 RPM is the default Critical Speed Nc where excitation matches natural frequency and phase lag crosses 90Â°, amplifying vibration by M = 1/(2Î¶).',
            id: '2100 RPM merupakan Kecepatan Kritis Nc bawaan saat frekuensi eksitasi menyamai frekuensi alami dan sudut fasa melewati 90Â°, sehingga amplitudo getaran diperkuat sebesar faktor M = 1/(2Î¶).',
            ja: '2100 RPMãŒæ—¢å®šã®å±é™ºé€Ÿåº¦ Nc ã§ã‚ã‚Šã€å›ºæœ‰æŒ¯å‹•æ•°ã¨ä¸€è‡´ã—ã¦ä½ç›¸é…ã‚ŒãŒ90Â°ã¨ãªã‚Šã€å…±æŒ¯å€çŽ‡ M = 1/(2Î¶) ã§æŒ¯å¹…ãŒå¢—å¹…ã•ã‚Œã‚‹ãŸã‚ã§ã™ã€‚',
          },
          keywords: ['2100', 'resonance', 'critical speed', 'nc', 'spike', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="vibration-iso"]',
    },
    {
      id: 'vib-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice single-plane balancing calculations, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan perhitungan penyeimbangan satu bidang, dan Kuis.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€ãƒ­ãƒ¼ã‚¿å‹•é‡£åˆã®ç†è§£ã‚’ç¢ºèªã—ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'vibration-meter': [
    {
      id: 'vm-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'Handheld Vibration Meter & Machine Route',
        id: 'Alat Ukur Getaran Genggam & Rute Inspeksi Mesin',
        ja: 'æºå¸¯åž‹æŒ¯å‹•è¨ˆã¨æ©Ÿæ¢°è¨ˆæ¸¬ãƒ«ãƒ¼ãƒˆ',
      },
      description: {
        en: 'Welcome! Perform a 4-point predictive maintenance route on a coupled motor-pump train using a handheld vibration analyzer to isolate unbalance, misalignment, looseness, and bearing wear.',
        id: 'Selamat datang! Lakukan inspeksi rute pemeliharaan prediktif 4 titik pada rangkaian motor-pompa terkopel menggunakan alat ukur getaran genggam untuk mengisolasi ketidakseimbangan (unbalance), ketidaksejajaran poros (misalignment), kelonggaran mekanis, dan keausan bantalan.',
        ja: 'ã‚ˆã†ã“ãï¼é›»å‹•æ©Ÿãƒ»ãƒãƒ³ãƒ—é€£çµæ©Ÿã‚’å¯¾è±¡ã«ã€æºå¸¯åž‹æŒ¯å‹•è¨ˆã«ã‚ˆã‚‹4ç‚¹å·¡å›žç‚¹æ¤œã‚’è¡Œã„ã€ä¸é‡£åˆãƒ»èŠ¯ãšã‚Œãƒ»ã‚¬ã‚¿ãƒ»è»¸å—æ‘©è€—ã®åˆ‡ã‚Šåˆ†ã‘ã‚’å®Ÿè·µã—ã¾ã™ã€‚',
      },
      tip: {
        en: 'High Velocity (mm/s) points to unbalance/misalignment, while high BDU points to rolling-element bearing damage.',
        id: 'Nilai Kecepatan Getaran / Velocity (mm/s) yang tinggi mengindikasikan unbalance atau misalignment, sedangkan nilai BDU yang tinggi menandakan kerusakan pada bantalan gelinding.',
        ja: 'é€Ÿåº¦ï¼ˆmm/sï¼‰ã®ä¸Šæ˜‡ã¯ä¸é‡£åˆã‚„èŠ¯ãšã‚Œã€BDUå€¤ã®ä¸Šæ˜‡ã¯è»¢ãŒã‚Šè»¸å—è‡ªä½“ã®æå‚·ã‚’ç¤ºå”†ã—ã¾ã™ã€‚',
      },
    },
    {
      id: 'vm-canvas',
      badge: { en: 'Feature 1 Â· Meter & Rig', id: 'Fitur 1 Â· Alat & Mesin', ja: 'æ©Ÿèƒ½1 Â· æŒ¯å‹•è¨ˆã¨æ©Ÿæ¢°å›³' },
      title: {
        en: 'Interactive Machine Diagram & Handheld Meter',
        id: 'Diagram Mesin Interaktif & Alat Ukur Genggam',
        ja: 'å¯¾è©±åž‹æ©Ÿæ¢°å›³ã¨æºå¸¯æŒ¯å‹•è¨ˆSVG',
      },
      description: {
        en: 'Click any of the 4 magnetic probe points directly on the motor-pump diagram, or press the mode button on the handheld vibration meter SVG to cycle measurement units.',
        id: 'Klik langsung salah satu dari 4 titik probe magnetik pada diagram motor-pompa, atau tekan tombol mode pada tampilan SVG alat ukur getaran genggam untuk mengganti satuan pengukuran.',
        ja: 'æ©Ÿæ¢°å›³ä¸Šã®4ã¤ã®ãƒ—ãƒ­ãƒ¼ãƒ–ä½ç½®ã‚’ç›´æŽ¥ã‚¯ãƒªãƒƒã‚¯ã™ã‚‹ã‹ã€æŒ¯å‹•è¨ˆSVGä¸Šã®ãƒœã‚¿ãƒ³ã§æ¸¬å®šãƒ¢ãƒ¼ãƒ‰ã‚’åˆ‡ã‚Šæ›¿ãˆã‚‹ã“ã¨ãŒã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vmeter-canvas"]',
    },
    {
      id: 'vm-modes',
      badge: { en: 'Feature 2 Â· Modes', id: 'Fitur 2 Â· Mode Ukur', ja: 'æ©Ÿèƒ½2 Â· æ¸¬å®šãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Four Vibration Measurement Modes',
        id: 'Empat Mode Pengukuran Getaran',
        ja: '4ç¨®é¡žã®æŒ¯å‹•æ¸¬å®šãƒ¢ãƒ¼ãƒ‰',
      },
      description: {
        en: 'Select Velocity (mm/s RMS) for ISO 10816-3 overall severity, Accel (g Peak) for high-frequency impacts, Disp (Î¼m P-P) for low-speed shaft motion, or Bearing (BDU) to isolate bearing damage.',
        id: 'Pilih Velocity (mm/s RMS) untuk evaluasi keparahan umum ISO 10816-3, Accel (g Peak) untuk mendeteksi tumbukan frekuensi tinggi, Disp (Î¼m P-P) untuk pergerakan poros berkecepatan rendah, atau Bearing (BDU) untuk mengisolasi kerusakan bantalan.',
        ja: 'ã€ŒVelocity (mm/s RMS)ã€ã§ISO 10816-3ç·åˆåˆ¤å®šã€ã€ŒAccel (g Peak)ã€ã§é«˜å‘¨æ³¢è¡æ’ƒã€ã€ŒDisp (Î¼m P-P)ã€ã§ä½Žé€Ÿå¤‰ä½ã€ã€ŒBearing (BDU)ã€ã§è»¢ãŒã‚Šè»¸å—æå‚·ã‚’è©•ä¾¡ã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vmeter-modes"]',
    },
    {
      id: 'vm-probe',
      badge: { en: 'Feature 3 Â· Probe Placement', id: 'Fitur 3 Â· Posisi Probe', ja: 'æ©Ÿèƒ½3 Â· ãƒ—ãƒ­ãƒ¼ãƒ–ä½ç½®' },
      title: {
        en: 'Magnetic Probe Placement (M-DE / M-NDE / P-DE / P-NDE)',
        id: 'Penempatan Probe Magnetik (M-DE / M-NDE / P-DE / P-NDE)',
        ja: 'ãƒžã‚°ãƒãƒƒãƒˆãƒ—ãƒ­ãƒ¼ãƒ–ä½ç½®ã®é¸æŠž',
      },
      description: {
        en: 'Move the magnetic accelerometer probe across Motor Drive End (M-DE), Motor Non-Drive End (M-NDE), Pump Drive End (P-DE), and Pump Non-Drive End (P-NDE) to localize where vibration peaks.',
        id: 'Pindahkan probe akselerometer magnetik di antara titik Motor Drive End (M-DE), Motor Non-Drive End (M-NDE), Pompa Drive End (P-DE), dan Pompa Non-Drive End (P-NDE) untuk melokalisasi lokasi puncak getaran.',
        ja: 'ãƒžã‚°ãƒãƒƒãƒˆãƒ—ãƒ­ãƒ¼ãƒ–ã‚’ãƒ¢ãƒ¼ã‚¿è² è·å´/åè² è·å´ã€ãƒãƒ³ãƒ—è² è·å´/åè² è·å´ã®4ç‚¹ã¸ç§»å‹•ã—ã€ã©ã®è»¸å—ã§æŒ¯å‹•ãŒæœ€å¤§ã«ãªã£ã¦ã„ã‚‹ã‹ã‚’åˆ‡ã‚Šåˆ†ã‘ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vmeter-probe"]',
    },
    {
      id: 'vm-route',
      badge: { en: 'Feature 4 Â· 4-Point Matrix', id: 'Fitur 4 Â· Matriks 4 Titik', ja: 'æ©Ÿèƒ½4 Â· 4ç‚¹ãƒ«ãƒ¼ãƒˆè¡¨' },
      title: {
        en: '4-Point Bearing Route Matrix',
        id: 'Matriks Rute Pengukuran 4 Titik Bantalan',
        ja: '4ç‚¹è»¸å—ãƒ«ãƒ¼ãƒˆè¨ˆæ¸¬ãƒžãƒˆãƒªãƒƒã‚¯ã‚¹',
      },
      description: {
        en: 'Compare VEL, ACC, DISP, and BDU side by side across all four bearings with ISO 10816-3 Zone Aâ€“D badges. Click any card in the matrix to jump the probe straight to that bearing.',
        id: 'Bandingkan nilai VEL, ACC, DISP, dan BDU secara berdampingan pada keempat bantalan beserta indikator Zona Aâ€“D ISO 10816-3. Klik kartu mana saja dalam matriks untuk langsung memindahkan probe ke bantalan tersebut.',
        ja: '4ã¤ã®è»¸å—ã®VELãƒ»ACCãƒ»DISPãƒ»BDUã¨ISO Zoneï¼ˆAã€œDï¼‰ã‚’ä¸€è¦§æ¯”è¼ƒã§ãã¾ã™ã€‚å„ã‚«ãƒ¼ãƒ‰ã‚’ã‚¯ãƒªãƒƒã‚¯ã™ã‚‹ã¨ãƒ—ãƒ­ãƒ¼ãƒ–ãŒãã®è»¸å—ã¸ç§»å‹•ã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vmeter-route"]',
    },
    {
      id: 'vm-rpm',
      badge: { en: 'Feature 5 Â· Speed RPM', id: 'Fitur 5 Â· Putaran RPM', ja: 'æ©Ÿèƒ½5 Â· å›žè»¢æ•°è¨­å®š' },
      title: {
        en: 'Machine Speed (900â€“3600 RPM)',
        id: 'Kecepatan Putar Mesin (900â€“3600 RPM)',
        ja: 'æ©Ÿæ¢°å›žè»¢æ•°ï¼ˆ900ã€œ3600 RPMï¼‰',
      },
      description: {
        en: 'Adjust Machine Speed with the slider or quick presets (1200, 1500, 1800, 3000, 3600 RPM) to observe how shaft speed scales velocity, acceleration, and displacement.',
        id: 'Atur Kecepatan Putar Mesin melalui penggeser atau preset cepat (1200, 1500, 1800, 3000, 3600 RPM) untuk mengamati bagaimana kecepatan poros memengaruhi nilai kecepatan (velocity), percepatan (akselerasi), dan perpindahan (displacement).',
        ja: 'å›žè»¢æ•°ã‚¹ãƒ©ã‚¤ãƒ€ãƒ¼ã¾ãŸã¯ãƒ—ãƒªã‚»ãƒƒãƒˆï¼ˆ1200ã€œ3600 RPMï¼‰ã‚’å¤‰æ›´ã—ã€é€Ÿåº¦ãƒ»åŠ é€Ÿåº¦ãƒ»å¤‰ä½ã¸ã®å½±éŸ¿ã‚’ç¢ºèªã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vmeter-rpm"]',
    },
    {
      id: 'vm-iso-class',
      badge: { en: 'Feature 6 Â· ISO Class', id: 'Fitur 6 Â· Kelas ISO', ja: 'æ©Ÿèƒ½6 Â· ISOã‚¯ãƒ©ã‚¹è¨­å®š' },
      title: {
        en: 'ISO 10816-3 Power & Foundation Class',
        id: 'Kelas Daya & Fondasi ISO 10816-3',
        ja: 'ISO 10816-3 å‡ºåŠ›ãƒ»åŸºç¤Žã‚¯ãƒ©ã‚¹',
      },
      description: {
        en: 'Select the ISO 10816-3 Power & Foundation Class. Notice the ISO threshold limits on the route matrix update dynamically for each machine class.',
        id: 'Pilih Kelas Daya & Fondasi ISO 10816-3. Perhatikan bahwa nilai ambang batas ISO pada matriks rute akan diperbarui secara dinamis untuk setiap kelas mesin.',
        ja: 'ISO 10816-3ã®å‡ºåŠ›ãƒ»åŸºç¤Žã‚¯ãƒ©ã‚¹ã‚’é¸æŠžã—ã¾ã™ã€‚ã‚¯ãƒ©ã‚¹ã«å¿œã˜ã¦ãƒ«ãƒ¼ãƒˆè¡¨ã®åˆ¤å®šã—ãã„å€¤ï¼ˆmm/sï¼‰ãŒè‡ªå‹•æ›´æ–°ã•ã‚Œã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vmeter-iso-class"]',
    },
    {
      id: 'vm-diagnostic',
      badge: { en: 'Feature 7 Â· Interpretation', id: 'Fitur 7 Â· Interpretasi', ja: 'æ©Ÿèƒ½7 Â· ç¾å ´è¨ºæ–­ã‚«ãƒ¼ãƒ‰' },
      title: {
        en: 'Field Diagnostic Interpretation & Action',
        id: 'Interpretasi Diagnostik Lapangan & Tindakan Rekomendasi',
        ja: 'ç¾å ´è¨ºæ–­ãŠã‚ˆã³æŽ¨å¥¨å‡¦ç½®',
      },
      description: {
        en: 'Read the Field Diagnostic Interpretation card for root-cause clues and the Recommended Action for the active fault scenario.',
        id: 'Baca kartu Interpretasi Diagnostik Lapangan untuk melihat petunjuk akar masalah serta Tindakan yang Direkomendasikan bagi skenario gangguan yang sedang aktif.',
        ja: 'ã€Œç¾å ´è¨ºæ–­ãŠã‚ˆã³æŽ¨å¥¨å‡¦ç½®ã€ã‚«ãƒ¼ãƒ‰ã§ã€é¸æŠžä¸­ã®ç•°å¸¸ã‚·ãƒŠãƒªã‚ªã®åŽŸå› åˆ†æžã¨å…·ä½“çš„ãªä¿å…¨å‡¦ç½®ã‚’ç¢ºèªã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="vmeter-diagnostic"]',
    },
    {
      id: 'vm-faults',
      badge: { en: 'Feature 8 Â· Troubleshoot', id: 'Fitur 8 Â· Diagnosis Masalah', ja: 'æ©Ÿèƒ½8 Â· æ•…éšœã‚·ãƒŠãƒªã‚ªè¨ºæ–­' },
      title: {
        en: 'Fault Scenarios & Route Troubleshooting',
        id: 'Skenario Gangguan & Penanganan Masalah Rute Inspeksi',
        ja: 'æ•…éšœã‚·ãƒŠãƒªã‚ªã¨ãƒ«ãƒ¼ãƒˆç•°å¸¸è¨ºæ–­',
      },
      description: {
        en: 'Inject faults from the Fault Scenario listâ€”such as unbalance, misalignment, looseness, bearing wear, or cavitationâ€”and troubleshoot by comparing M-DE/M-NDE vs. P-DE/P-NDE readings in the 4-point matrix.',
        id: 'Simulasikan gangguan dari daftar Skenario Gangguanâ€”seperti ketidakseimbangan (unbalance), ketidaksejajaran (misalignment), kelonggaran mekanis, keausan bantalan, atau kavitasiâ€”lalu lakukan diagnosis masalah dengan membandingkan pembacaan M-DE/M-NDE terhadap P-DE/P-NDE pada matriks 4 titik.',
        ja: 'ã€Œæ•…éšœã‚·ãƒŠãƒªã‚ªã€ã‚’åˆ‡ã‚Šæ›¿ãˆã¦ãƒ¢ãƒ¼ã‚¿å´ï¼ˆM-DE/M-NDEï¼‰ã¨ãƒãƒ³ãƒ—å´ï¼ˆP-DE/P-NDEï¼‰ã®æŒ¯å‹•å·®ã‚’æ¯”è¼ƒã—ã€ã©ã®æ©Ÿå™¨ã®ç•°å¸¸ã‹ã‚’åˆ‡ã‚Šåˆ†ã‘ã¾ã—ã‚‡ã†ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'How do I distinguish misalignment from bearing wear?',
            id: 'Bagaimana cara membedakan ketidaksejajaran poros (misalignment) dari keausan bantalan?',
            ja: 'èŠ¯ãšã‚Œï¼ˆãƒŸã‚¹ã‚¢ãƒ©ã‚¤ãƒ¡ãƒ³ãƒˆï¼‰ã¨è»¸å—æ‘©è€—ã¯ã©ã†è¦‹åˆ†ã‘ã¾ã™ã‹ï¼Ÿ',
          },
          a: {
            en: 'Misalignment elevates Velocity (mm/s) across the coupling (M-DE and P-DE) while BDU stays normal. Bearing wear spikes BDU and Accel (g) locally at the damaged bearing.',
            id: 'Misalignment menaikkan nilai Velocity (mm/s) di kedua sisi kopling (M-DE dan P-DE) sementara BDU tetap normal. Sebaliknya, keausan bantalan menyebabkan lonjakan tajam pada BDU dan Accel (g) secara terlokalisasi di bantalan yang mengalami kerusakan.',
            ja: 'èŠ¯ãšã‚Œã¯ã‚«ãƒƒãƒ—ãƒªãƒ³ã‚°ä¸¡å´ï¼ˆM-DEã¨P-DEï¼‰ã®é€Ÿåº¦ï¼ˆmm/sï¼‰ãŒä¸Šæ˜‡ã—BDUã¯æ­£å¸¸ã§ã™ã€‚è»¸å—æ‘©è€—ã¯æå‚·ã—ãŸè»¸å—ã®ã¿ã§BDUå€¤ã¨åŠ é€Ÿåº¦ï¼ˆgï¼‰ãŒæ€¥ä¸Šæ˜‡ã—ã¾ã™ã€‚',
          },
          keywords: ['misalignment', 'bearing', 'bdu', 'velocity', 'distinguish', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="vmeter-faults"]',
    },
    {
      id: 'vm-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice diagnosing 4-point routes, and the ISO 10816-3 Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan diagnosis rute 4 titik, dan Kuis ISO 10816-3.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€4ç‚¹è¨ˆæ¸¬ã‹ã‚‰ã®ç•°å¸¸åˆ‡ã‚Šåˆ†ã‘ã‚’ç¿’å¾—ã—ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'weld-strength': [
    {
      id: 'weld-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: 'æ¦‚è¦' },
      title: {
        en: 'AWS Weld Joint Strength & Stress Lab',
        id: 'Lab Kekuatan Sambungan Las & Tegangan AWS',
        ja: 'AWSæº¶æŽ¥ç¶™æ‰‹å¼·åº¦ãƒ»å¿œåŠ›è§£æžãƒ©ãƒœ',
      },
      description: {
        en: 'Welcome! Analyze structural welds across Lap / T-Fillet, Eccentric Bracket, and Butt Groove jointsâ€”evaluating design throat a, effective area Aw, combined shear/bending stress, and AWS safety factors.',
        id: 'Selamat datang! Analisis kekuatan las struktural pada sambungan Fillet Tumpang / T, Braket Eksentrik, dan Kampuh Tumpul (Butt Groove)â€”mengevaluasi tebal leher desain a, luas efektif Aw, tegangan geser/lentur gabungan, serta faktor keamanan standar AWS.',
        ja: 'ã‚ˆã†ã“ãï¼é‡ã­/Tå½¢ã™ã¿è‚‰ãƒ»åå¿ƒãƒ–ãƒ©ã‚±ãƒƒãƒˆãƒ»çªåˆã›é–‹å…ˆæº¶æŽ¥ã®ç†è«–ã®ã©åŽš aã€æœ‰åŠ¹ã®ã©æ–­é¢ç© Awã€åˆæˆå¿œåŠ›ã€AWSå®‰å…¨çŽ‡ã‚’2D CADå›³ã¨ã¨ã‚‚ã«è§£æžã—ã¾ã™ã€‚',
      },
      tip: {
        en: 'For a 45Â° equal-leg fillet weld, effective throat a = 0.707 Ã— leg size s.',
        id: 'Untuk las fillet sama kaki 45Â°, tebal leher efektif a = 0,707 Ã— ukuran kaki s.',
        ja: 'ç­‰è„š45Â°ã™ã¿è‚‰æº¶æŽ¥ã§ã¯ã€ç†è«–ã®ã©åŽš a = 0.707 Ã— è„šé•· s ã¨ãªã‚Šã¾ã™ã€‚',
      },
    },
    {
      id: 'weld-modes',
      badge: { en: 'Feature 1 Â· Joint & Presets', id: 'Fitur 1 Â· Jenis & Preset', ja: 'æ©Ÿèƒ½1 Â· ç¶™æ‰‹å½¢å¼ã¨ãƒ—ãƒªã‚»ãƒƒãƒˆ' },
      title: {
        en: 'Joint Type Tabs, Design Presets & CSV Export',
        id: 'Tab Jenis Sambungan, Preset Desain & Ekspor CSV',
        ja: 'ç¶™æ‰‹å½¢å¼ãƒ»è¨­è¨ˆãƒ—ãƒªã‚»ãƒƒãƒˆãƒ»CSVå‡ºåŠ›',
      },
      description: {
        en: 'Switch between 1. Lap / T-Fillet, 2. Eccentric Bracket, and 3. Butt Groove Weld, apply standard AWS Design Presets, Reset parameters, or Export CSV.',
        id: 'Beralihlah antara 1. Fillet Tumpang / T, 2. Braket Eksentrik, dan 3. Kampuh Tumpul, terapkan Preset Desain standar AWS, Reset parameter, atau Ekspor data ke CSV.',
        ja: '3ã¤ã®ç¶™æ‰‹å½¢å¼ã‚¿ãƒ–ã‚’åˆ‡ã‚Šæ›¿ãˆã€è¨­è¨ˆãƒ—ãƒªã‚»ãƒƒãƒˆã®é©ç”¨ã€ãƒ‘ãƒ©ãƒ¡ãƒ¼ã‚¿ã®åˆæœŸåŒ–ã€CSVãƒ‡ãƒ¼ã‚¿å‡ºåŠ›ãŒè¡Œãˆã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="weld-modes"]',
    },
    {
      id: 'weld-canvas',
      badge: { en: 'Feature 2 Â· 2D CAD Joint', id: 'Fitur 2 Â· CAD Sambungan', ja: 'æ©Ÿèƒ½2 Â· 2D CADæº¶æŽ¥å›³' },
      title: {
        en: 'Live Structural Weld CAD & Stress Vectors',
        id: 'Diagram CAD Las Struktural & Vektor Tegangan Secara Langsung',
        ja: 'ãƒ©ã‚¤ãƒ–æ§‹é€ æº¶æŽ¥CADãƒ»å¿œåŠ›ãƒ™ã‚¯ãƒˆãƒ«å›³',
      },
      description: {
        en: 'Inspect the 2D joint geometry, weld throat cross-section, eccentric moment arm e, bevel angle, and color-coded stress intensity across the weld group.',
        id: 'Amati geometri sambungan 2D, penampang leher las, lengan momen eksentrik e, sudut kampuh, dan intensitas tegangan berkode warna pada kelompok sambungan las.',
        ja: '2Dç¶™æ‰‹å½¢çŠ¶ã€ã®ã©åŽšæ–­é¢ã€åå¿ƒè·é›¢ eã€é–‹å…ˆè§’åº¦ã€æº¶æŽ¥ç¾¤ã®å¿œåŠ›åˆ†å¸ƒã‚«ãƒ©ãƒ¼è¡¨ç¤ºã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã§ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="weld-canvas"]',
    },
    {
      id: 'weld-electrode',
      badge: { en: 'Feature 3 Â· Electrode', id: 'Fitur 3 Â· Elektroda', ja: 'æ©Ÿèƒ½3 Â· æº¶æŽ¥æ£’é¸å®š' },
      title: {
        en: 'Electrode / Filler Alloy Selection',
        id: 'Pemilihan Elektroda / Logam Pengisi Las',
        ja: 'æº¶æŽ¥æ£’ãƒ»æº¶åŠ æã®é¸å®š',
      },
      description: {
        en: 'Choose the Electrode / Filler Alloy (e.g., E70XX, E80XX, E60XX) from the dropdownâ€”displaying welding process, UTS, and AWS allowable shear stress.',
        id: 'Pilih Elektroda / Logam Pengisi (misalnya E70XX, E80XX, E60XX) dari daftar pilihanâ€”menampilkan proses pengelasan, kekuatan tarik puncak (UTS), dan tegangan geser izin AWS.',
        ja: 'æº¶æŽ¥æ£’ãƒ»æº¶åŠ æï¼ˆE70XXãƒ»E80XXç­‰ï¼‰ã‚’é¸æŠžã™ã‚‹ã¨ã€æº¶æŽ¥ãƒ—ãƒ­ã‚»ã‚¹ãƒ»å¼•å¼µå¼·ã• UTSãƒ»AWSè¨±å®¹ã›ã‚“æ–­å¿œåŠ›ãŒè¨­å®šã•ã‚Œã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="weld-electrode"]',
    },
    {
      id: 'weld-dimensions',
      badge: { en: 'Feature 4 Â· Dimensions & Load', id: 'Fitur 4 Â· Dimensi & Beban', ja: 'æ©Ÿèƒ½4 Â· å¯¸æ³•ã¨è·é‡' },
      title: {
        en: 'Joint Dimensions, Passes, Pattern & Applied Load F',
        id: 'Dimensi Sambungan, Lapisan Las, Pola & Beban Kerja F',
        ja: 'ç¶™æ‰‹å¯¸æ³•ãƒ»ãƒ‘ã‚¿ãƒ¼ãƒ³ãƒ»ä½œç”¨å¤–åŠ› F',
      },
      description: {
        en: 'Configure mode-specific geometryâ€”Fillet Passes, Orientation & Leg Size s (Mode 1), Weld Pattern & Eccentricity e (Mode 2), or Groove Prep & Penetration CJP/PJP (Mode 3)â€”plus the universal Applied Load (F) slider.',
        id: 'Konfigurasikan geometri sesuai modeâ€”Jumlah Lapisan Las, Orientasi & Ukuran Kaki s (Mode 1), Pola Las & Eksentrisitas e (Mode 2), atau Persiapan Kampuh & Penetrasi CJP/PJP (Mode 3)â€”serta penggeser Beban Kerja (F).',
        ja: 'ãƒ¢ãƒ¼ãƒ‰åˆ¥ã®å½¢çŠ¶ãƒ»é…ç½®ï¼ˆã™ã¿è‚‰é…ç½®/è·é‡æ–¹å‘ã€åå¿ƒè·é›¢ eã€é–‹å…ˆå½¢çŠ¶/æº¶è¾¼ã¿CJPãƒ»PJPï¼‰ã¨å…±é€šã®ä½œç”¨å¤–åŠ› (F) ã‚¹ãƒ©ã‚¤ãƒ€ãƒ¼ã‚’è¨­å®šã—ã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="weld-dimensions"]',
    },
    {
      id: 'weld-summary',
      badge: { en: 'Feature 5 Â· Summary Cards', id: 'Fitur 5 Â· Kartu Ringkasan', ja: 'æ©Ÿèƒ½5 Â· ã‚µãƒžãƒªãƒ¼ã‚«ãƒ¼ãƒ‰' },
      title: {
        en: 'Throat, Effective Area, Peak Stress & Safety Factor',
        id: 'Tebal Leher, Luas Efektif, Tegangan Puncak & Faktor Keamanan',
        ja: 'ã®ã©åŽšãƒ»æœ‰åŠ¹æ–­é¢ç©ãƒ»æœ€å¤§å¿œåŠ›ãƒ»å®‰å…¨çŽ‡',
      },
      description: {
        en: 'Inspect Throat (a = 0.707s), Effective Area Aw, Peak Joint Stress, and the color-coded Safety Factor card (PASS / MARGINAL / FAIL) directly below the 2D CAD SVG.',
        id: 'Periksa Tebal Leher (a = 0,707s), Luas Efektif Aw, Tegangan Puncak Sambungan, dan kartu Faktor Keamanan berkode warna (PASS / MARGINAL / FAIL) tepat di bawah diagram SVG CAD 2D.',
        ja: 'CADå›³ã®ä¸‹ã§ç†è«–ã®ã©åŽš aã€æœ‰åŠ¹ã®ã©æ–­é¢ç© Awã€æœ€å¤§åˆæˆå¿œåŠ›ã€è‰²åˆ†ã‘ã•ã‚ŒãŸå®‰å…¨çŽ‡ã‚«ãƒ¼ãƒ‰ï¼ˆPASS/MARGINAL/FAILï¼‰ã‚’ç¢ºèªã§ãã¾ã™ã€‚',
      },
      targetSelector: '[data-tour="weld-summary"]',
    },
    {
      id: 'weld-breakdown',
      badge: { en: 'Feature 6 Â· Troubleshoot', id: 'Fitur 6 Â· Diagnostik Tegangan', ja: 'æ©Ÿèƒ½6 Â· å¿œåŠ›è¨ºæ–­å†…è¨³' },
      title: {
        en: 'Stress Distribution Breakdown & Overload Troubleshooting',
        id: 'Rincian Distribusi Tegangan & Penanganan Beban Berlebih',
        ja: 'å¿œåŠ›æˆåˆ†è§£æžå†…è¨³ã¨éŽè² è·ãƒˆãƒ©ãƒ–ãƒ«ã‚·ãƒ¥ãƒ¼ãƒ†ã‚£ãƒ³ã‚°',
      },
      description: {
        en: 'Compare Direct Shear Ï„â€² (or Axial Stress) against Secondary Torsional Shear Ï„â€³ / Bending Stress, AWS Allowable Limit, and the Stress Utilization % bar. When utilization exceeds 100% (red / FAIL), troubleshoot by increasing leg size s, switching to Double passes or CJP, upgrading the electrode, or reducing eccentricity e.',
        id: 'Bandingkan Geser Langsung Ï„â€² (atau Tegangan Aksial) terhadap Geser Torsi Sekunder Ï„â€³ / Tegangan Lentur, Batas Izin AWS, dan bilah Utilisasi Tegangan %. Apabila utilisasi melebihi 100% (merah / FAIL), atasi dengan memperbesar ukuran kaki las s, beralih ke pengelasan ganda (Double) atau penetrasi penuh (CJP), meningkatkan mutu elektroda, atau mengurangi eksentrisitas e.',
        ja: 'ä¸€æ¬¡ç›´æŽ¥ã›ã‚“æ–­ãƒ»è»¸å¿œåŠ›ã¨äºŒæ¬¡ã­ã˜ã‚Š/æ›²ã’å¿œåŠ›ã€AWSè¨±å®¹é™åº¦ã€å¿œåŠ›åˆ©ç”¨çŽ‡ãƒãƒ¼ã‚’æ¯”è¼ƒã—ã¾ã™ã€‚åˆ©ç”¨çŽ‡ãŒ100%ï¼ˆèµ¤/FAILï¼‰ã‚’è¶…ãˆãŸå ´åˆã¯ã€è„šé•· s ã®å¢—åŠ ã€ä¸¡é¢æº¶æŽ¥/CJPåŒ–ã€é«˜å¼·åº¦é›»æ¥µã¸ã®å¤‰æ›´ã€åå¿ƒ e ã®ä½Žæ¸›ã§æ”¹å–„ã—ã¾ã—ã‚‡ã†ã€‚',
      },
      faqs: [
        {
          q: {
            en: 'Why does the eccentric bracket fail when direct shear Ï„â€² is low?',
            id: 'Mengapa sambungan braket eksentrik mengalami kegagalan padahal tegangan geser langsung Ï„â€² tergolong kecil?',
            ja: 'ä¸€æ¬¡ã›ã‚“æ–­å¿œåŠ› Ï„â€² ãŒä½Žã„ã®ã«åå¿ƒãƒ–ãƒ©ã‚±ãƒƒãƒˆãŒFAILã«ãªã‚‹ã®ã¯ãªãœï¼Ÿ',
          },
          a: {
            en: 'Eccentricity e creates a twisting moment M = FÂ·e, inducing large secondary torsional shear Ï„â€³ at the outermost weld corners. Resultant stress is âˆš(Ï„â€²Â² + Ï„â€³Â² + ...), which can exceed AWS limits.',
            id: 'Eksentrisitas e menimbulkan momen puntir M = FÂ·e yang membangkitkan tegangan geser torsi sekunder Ï„â€³ yang besar pada sudut terjauh sambungan las. Tegangan resultan âˆš(Ï„â€²Â² + Ï„â€³Â² + ...) inilah yang melampaui batas izin AWS.',
            ja: 'åå¿ƒè·é›¢ e ã«ã‚ˆã‚‹ã­ã˜ã‚Šãƒ¢ãƒ¼ãƒ¡ãƒ³ãƒˆ M = FÂ·e ãŒæº¶æŽ¥ç¾¤ã®æœ€å¤–ç¸ã«å¤§ããªäºŒæ¬¡ã›ã‚“æ–­å¿œåŠ› Ï„â€³ ã‚’ç”Ÿã˜ã•ã›ã€åˆæˆå¿œåŠ›ãŒAWSè¨±å®¹é™åº¦ã‚’è¶…ãˆã‚‹ãŸã‚ã§ã™ã€‚',
          },
          keywords: ['eccentric', 'torsional', 'fail', 'secondary', 'shear', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="weld-breakdown"]',
    },
    {
      id: 'weld-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: 'å­¦ç¿’ãƒ¢ãƒ¼ãƒ‰' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆãƒ»æŽ¢ç´¢ãƒ»æ¼”ç¿’ãƒ»ã‚¯ã‚¤ã‚º',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice weld throat & eccentric bracket problems, and the AWS Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal ukuran leher las & braket eksentrik, serta Kuis AWS.',
        ja: 'ä¸Šéƒ¨ã®ãƒ¢ãƒ¼ãƒ‰ã‚¿ãƒ–ï¼ˆã¾ãŸã¯ Alt+1ã€œ4ï¼‰ã§ã€ŒæŽ¢ç´¢ã€ã€Œã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ãƒˆã€ã€Œæ¼”ç¿’ã€ã€Œã‚¯ã‚¤ã‚ºã€ã‚’åˆ‡ã‚Šæ›¿ãˆã€ã®ã©åŽšè¨ˆç®—ã‚„åå¿ƒãƒ–ãƒ©ã‚±ãƒƒãƒˆè¨­è¨ˆã®ç†è§£ã‚’ç¢ºèªã—ã¾ã—ã‚‡ã†ã€‚',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],
};
