require('dotenv').config();

const {
    sequelize,
    User,
    Category,
    Product,
    ProductImage,
    Wishlist,
    Cart,
    Order,
    OrderItem,
    Payment,
} = require('../src/models');

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        await sequelize.sync({ force: true });
        console.log('🗑️  Tablas recreadas');

        // ==================== USUARIOS ====================
        const admin = await User.create({
            name: 'Administrador Principal',
            identificationNumber: '1003828562',
            birthDate: '2002-11-28',
            address: 'Calle 1 #1-01',
            city: 'Neiva',
            department: 'Huila',
            email: 'davidcito01012002@gmail.com',
            password: '409KL00c.',
            role: 'admin',
            emailVerified: true,
        });

        const customer1 = await User.create({
            name: 'Carlos Martínez',
            identificationNumber: '1000000002',
            birthDate: '1995-06-20',
            address: 'Carrera 10 #20-30',
            city: 'Medellín',
            department: 'Antioquia',
            email: 'carlos@email.com',
            password: 'password123',
            role: 'customer',
            emailVerified: true,
        });

        const customer2 = await User.create({
            name: 'María López',
            identificationNumber: '1000000003',
            birthDate: '1998-03-10',
            address: 'Avenida 5 #15-25',
            city: 'Cali',
            department: 'Valle del Cauca',
            email: 'maria@email.com',
            password: 'password123',
            role: 'customer',
            emailVerified: true,
        });

        console.log('👥 Usuarios creados');

        await Cart.create({ userId: admin.id });
        await Cart.create({ userId: customer1.id });
        await Cart.create({ userId: customer2.id });
        console.log('🛒 Carritos creados');

        // ==================== CATEGORÍAS ====================
        const categories = await Category.bulkCreate([
            {
                name: 'Ratones Gamer',
                description: 'Ratones y periféricos de precisión para gaming competitivo',
                imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80',
            },
            {
                name: 'Teclados Gamer',
                description: 'Teclados mecánicos, compactos y full-size para gaming',
                imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
            },
            {
                name: 'Auriculares Gamer',
                description: 'Auriculares alámbricos e inalámbricos para juego competitivo',
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
            },
            {
                name: 'Mousepads',
                description: 'Superficies de control para ratón en distintos tamaños y texturas',
                imageUrl: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=80',
            },
            {
                name: 'Monitores Gamer',
                description: 'Monitores de alta tasa de refresco y baja latencia',
                imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
            },
            {
                name: 'Celulares',
                description: 'Smartphones y accesorios de alto rendimiento',
                imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
            },
            {
                name: 'Accesorios Gamer',
                description: 'Accesorios complementarios para setups gamers',
                imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
            },
        ]);
        console.log('📂 Categorías creadas');

        // ==================== PRODUCTOS ====================
        const products = await Product.bulkCreate([
            // ── RATONES ────────────────────────────────────────────────────────
            {
                name: 'Mouse Gamer Logitech G502 X',
                description: 'El Logitech G502 X redefine la precisión en el gaming competitivo. Equipado con el revolucionario sensor HERO 25K, este ratón ofrece un seguimiento exacto a 25.600 DPI con prácticamente cero aceleración. Sus switches híbridos óptico-mecánicos garantizan una respuesta instantánea y una vida útil de más de 100 millones de clics. La distribución de peso asimétrica y la forma ergonómica reducen la fatiga en sesiones largas.',
                brand: 'Logitech',
                color: 'Negro',
                price: 320000,
                originalPrice: 399000,
                discountPercentage: 20,
                stock: 75,
                categoryId: categories[0].id,
                featured: true,
                supplier: 'Logitech Colombia S.A.S.',
                specifications: {
                    'Sensor': 'HERO 25K',
                    'DPI máximo': '25.600',
                    'Botones': '13 programables',
                    'Polling rate': '1000 Hz',
                    'Peso': '106 g',
                    'Conexión': 'USB-A',
                    'Cable': 'Trenzado 1.8 m',
                    'Iluminación': 'RGB LIGHTSYNC',
                },
            },
            {
                name: 'Mouse Gamer Razer DeathAdder V3',
                description: 'El DeathAdder V3 es el ratón gamer ultraligero más vendido de Razer. Con tan solo 59 g gracias a su diseño Shell exterior y estructura interna optimizada, permite movimientos más rápidos sin sacrificar la precisión. El sensor óptico Focus Pro de 30K DPI con tecnología Smart Tracking elimina el acelerador de velocidad y el cursor landing, asegurando un rastreo perfecto sobre cualquier superficie.',
                brand: 'Razer',
                color: 'Negro',
                price: 350000,
                stock: 60,
                categoryId: categories[0].id,
                featured: true,
                supplier: 'Razer Latam Distribuciones',
                specifications: {
                    'Sensor': 'Focus Pro 30K',
                    'DPI máximo': '30.000',
                    'Botones': '6 programables',
                    'Polling rate': '1000 Hz',
                    'Peso': '59 g',
                    'Conexión': 'USB-A',
                    'Cable': 'Speedflex 2.1 m',
                    'Iluminación': 'Razer Chroma RGB',
                },
            },
            {
                name: 'Mouse Logitech G305 Inalámbrico',
                description: 'El G305 LIGHTSPEED ofrece rendimiento gamer inalámbrico de alta velocidad a un precio accesible. Con tecnología LIGHTSPEED de Logitech, la conexión inalámbrica es tan rápida como la cableada (latencia <1 ms). Una sola pila AA brinda hasta 250 horas de batería. Su sensor HERO ofrece precisión de 12.000 DPI con consumo energético ultra eficiente.',
                brand: 'Logitech',
                color: 'Blanco',
                price: 210000,
                originalPrice: 259000,
                discountPercentage: 19,
                stock: 88,
                categoryId: categories[0].id,
                featured: false,
                supplier: 'Logitech Colombia S.A.S.',
                specifications: {
                    'Sensor': 'HERO 12K',
                    'DPI máximo': '12.000',
                    'Conexión': 'LIGHTSPEED Inalámbrico',
                    'Batería': '1 × AA — 250 h',
                    'Peso': '99 g (sin pila)',
                    'Polling rate': '1000 Hz',
                    'Botones': '6',
                },
            },

            // ── TECLADOS ───────────────────────────────────────────────────────
            {
                name: 'Teclado Mecánico HyperX Alloy Origins',
                description: 'El HyperX Alloy Origins es un teclado mecánico compacto TKL (tenkeyless) construido en aluminio aeronáutico de alta durabilidad. Sus switches propios HyperX Red (lineales) brindan una acción suave y silenciosa, ideal para gaming y escritura prolongada. La iluminación RGB por tecla con 5 zonas independientes permite personalizaciones completas desde el software NGenuity. La placa de acero reforzada elimina el flex.',
                brand: 'HyperX',
                color: 'Negro',
                price: 450000,
                stock: 40,
                categoryId: categories[1].id,
                featured: true,
                supplier: 'HP/HyperX Colombia',
                specifications: {
                    'Switches': 'HyperX Red (lineal)',
                    'Factor': 'TKL (87 teclas)',
                    'Iluminación': 'RGB por tecla',
                    'Cuerpo': 'Aluminio aeronáutico',
                    'Anti-ghosting': '100% — N-Key Rollover',
                    'Conexión': 'USB-A 1.8 m',
                    'Teclas macro': '3 perfiles on-board',
                },
            },
            {
                name: 'Teclado Mecánico Redragon K552 Kumara',
                description: 'El Redragon K552 Kumara es la puerta de entrada perfecta al mundo de los teclados mecánicos. Su diseño compacto 87 teclas (TKL) elimina el teclado numérico para ganar espacio de mousepad sin perder ninguna tecla de función. Los switches Outemu Blue garantizan un feedback táctil y audible con cada pulsación, preferido por muchos jugadores competitivos. Retroiluminación roja integrada con 9 efectos preconfigurados.',
                brand: 'Redragon',
                color: 'Negro',
                price: 185000,
                originalPrice: 229000,
                discountPercentage: 19,
                stock: 90,
                categoryId: categories[1].id,
                featured: false,
                supplier: 'Redragon Importaciones CO',
                specifications: {
                    'Switches': 'Outemu Blue (táctil/clicky)',
                    'Factor': 'TKL (87 teclas)',
                    'Iluminación': 'LED Rojo',
                    'Cuerpo': 'ABS',
                    'Anti-ghosting': 'N-Key Rollover',
                    'Conexión': 'USB-A 1.5 m',
                    'Vida útil switches': '50 millones de clics',
                },
            },
            {
                name: 'Teclado Mecánico Corsair K70 RGB Pro',
                description: 'El Corsair K70 RGB Pro es el teclado de referencia para esports profesionales. La placa de aluminio de alta resistencia asegura una estructura rígida y lujosa. Con switches Cherry MX Red registrados como los más precisos del mercado, cada pulsación actúa en 2 mm de recorrido. El AXON Hyper-Processing Technology procesa las entradas 8× más rápido que los teclados convencionales (polling rate de 8.000 Hz).',
                brand: 'Corsair',
                color: 'Negro',
                price: 580000,
                stock: 25,
                categoryId: categories[1].id,
                featured: true,
                supplier: 'Corsair Latam',
                specifications: {
                    'Switches': 'Cherry MX Red (lineal)',
                    'Factor': 'Full Size (104 teclas)',
                    'Iluminación': 'RGB por tecla (16.8M colores)',
                    'Cuerpo': 'Aluminio anodizado',
                    'Polling rate': '8.000 Hz',
                    'Anti-ghosting': '100% N-Key Rollover',
                    'Memoria on-board': '8 MB',
                    'Conexión': 'USB-A doble 1.8 m',
                },
            },

            // ── AURICULARES ────────────────────────────────────────────────────
            {
                name: 'Auriculares Inalámbricos Logitech G733',
                description: 'El Logitech G733 LIGHTSPEED combina libertad inalámbrica con sonido de estudio. Gracias a la tecnología LIGHTSPEED de Logitech, obtendrás una conexión inalámbrica de ultra baja latencia ideal para gaming competitivo. Sus drivers PRO-G de 40 mm entregan frecuencias entre 20 Hz y 20 kHz con una respuesta en frecuencia excepcionalmente plana. El micrófono cardioide con cancelación de ruido Blue VO!CE asegura una voz cristalina.',
                brand: 'Logitech',
                color: 'Azul',
                price: 550000,
                originalPrice: 680000,
                discountPercentage: 19,
                stock: 35,
                categoryId: categories[2].id,
                featured: true,
                supplier: 'Logitech Colombia S.A.S.',
                specifications: {
                    'Driver': 'PRO-G 40 mm',
                    'Respuesta en frecuencia': '20 Hz – 20 kHz',
                    'Conexión': 'LIGHTSPEED 2.4 GHz',
                    'Batería': 'Hasta 29 h',
                    'Micrófono': 'Cardioide desmontable',
                    'Cancelación de ruido': 'Blue VO!CE',
                    'Iluminación': 'RGB LIGHTSYNC',
                    'Peso': '278 g',
                },
            },
            {
                name: 'Auriculares HyperX Cloud II',
                description: 'Los HyperX Cloud II son referencia en auriculares gaming por su relación calidad-precio. El sonido surround virtual 7.1 sitúa cada efecto de sonido con precisión milimétrica: pasos, disparos, explosiones. Sus almohadillas de espuma viscoelástica y la diadema acolchada de cuero sintético garantizan comodidad en sesiones de varias horas. El micrófono uni-direccional con cancelación de ruido integrado es desmontable con conector 3.5 mm.',
                brand: 'HyperX',
                color: 'Rojo',
                price: 340000,
                stock: 50,
                categoryId: categories[2].id,
                featured: false,
                supplier: 'HP/HyperX Colombia',
                specifications: {
                    'Driver': '53 mm, neodimio',
                    'Respuesta en frecuencia': '15 Hz – 25 kHz',
                    'Surround virtual': '7.1 (via USB)',
                    'Conexión': '3.5 mm + adaptador USB',
                    'Micrófono': 'Uni-direccional, desmontable',
                    'Impedancia': '60 Ω',
                    'Peso': '309 g',
                },
            },
            {
                name: 'Auriculares Razer BlackShark V2 X',
                description: 'El BlackShark V2 X fue diseñado junto a profesionales esports para ofrecer ventaja competitiva real. Los drivers Razer TriForce Titanium de 50 mm dividen el diafragma en tres zonas independientes, reproduciendo bajos, medios y agudos con claridad excepcional. El micrófono Razer HyperClear super-cardioide suprime el ruido ambiente hasta en un 60%. Compatible con PC, PS5, Xbox, Nintendo Switch y móvil mediante jack 3.5 mm.',
                brand: 'Razer',
                color: 'Negro',
                price: 270000,
                originalPrice: 320000,
                discountPercentage: 16,
                stock: 42,
                categoryId: categories[2].id,
                featured: false,
                supplier: 'Razer Latam Distribuciones',
                specifications: {
                    'Driver': 'TriForce Titanium 50 mm',
                    'Respuesta en frecuencia': '12 Hz – 28 kHz',
                    'Conexión': '3.5 mm (4 polos)',
                    'Micrófono': 'Super-cardioide HyperClear',
                    'Compatibilidad': 'PC, PS5, Xbox, Switch, Móvil',
                    'Peso': '240 g',
                    'Impedancia': '32 Ω',
                },
            },

            // ── MOUSEPADS ──────────────────────────────────────────────────────
            {
                name: 'Mousepad XL SteelSeries QcK Heavy',
                description: 'El SteelSeries QcK Heavy XXL es la superficie de referencia para gamers profesionales de CS:GO, Valorant y otros títulos de puntería. Su tela micro-tejida de alta densidad proporciona un control de cursor uniforme y predecible a cualquier sensibilidad. La base de goma antideslizante de 6 mm de grosor (doble del estándar) absorbe vibraciones y mantiene el pad perfectamente fijo sobre cualquier escritorio.',
                brand: 'SteelSeries',
                color: 'Negro',
                price: 110000,
                stock: 120,
                categoryId: categories[3].id,
                featured: false,
                supplier: 'SteelSeries Colombia',
                specifications: {
                    'Dimensiones': '900 × 300 mm',
                    'Grosor': '6 mm',
                    'Material superior': 'Tela micro-tejida',
                    'Base': 'Goma antideslizante',
                    'Optimizado para': 'Control / velocidad',
                    'Costuras': 'Perimetral reforzada',
                },
            },
            {
                name: 'Mousepad Razer Gigantus V2 XL',
                description: 'El Razer Gigantus V2 XL es un mousepad de gran formato que cubre la mayor parte de tu escritorio, brindando espacio ilimitado tanto para el ratón como para el teclado. La superficie de tela texturizada de micro-tejido ofrece el equilibrio perfecto entre velocidad y control, con una resistencia al desgaste superior. La base de goma con compuesto antideslizante premium mantiene el pad estático incluso durante movimientos bruscos.',
                brand: 'Razer',
                color: 'Negro',
                price: 125000,
                originalPrice: 149000,
                discountPercentage: 16,
                stock: 95,
                categoryId: categories[3].id,
                featured: false,
                supplier: 'Razer Latam Distribuciones',
                specifications: {
                    'Dimensiones': '920 × 294 mm',
                    'Grosor': '3 mm',
                    'Material superior': 'Micro-tejido Razer',
                    'Base': 'Goma natural antideslizante',
                    'Costuras': 'Perimetral',
                },
            },

            // ── MONITORES ─────────────────────────────────────────────────────
            {
                name: 'Monitor Gamer Samsung Odyssey G5 27"',
                description: 'El Samsung Odyssey G5 presenta una pantalla curva 1000R que envuelve tu campo visual para una inmersión total. La resolución QHD (2560×1440) triplica los píxeles de un Full HD, revelando detalles que antes pasaban inadvertidos. Con 144 Hz de tasa de refresco y 1 ms de tiempo de respuesta MPRT, los movimientos rápidos se ven con nitidez absoluta. Soporte nativo para AMD FreeSync Premium elimina el tearing en juegos.',
                brand: 'Samsung',
                color: 'Negro',
                price: 1250000,
                originalPrice: 1499000,
                discountPercentage: 17,
                stock: 28,
                categoryId: categories[4].id,
                featured: true,
                supplier: 'Samsung Electronics Colombia',
                specifications: {
                    'Tamaño': '27 pulgadas',
                    'Resolución': 'QHD 2560 × 1440',
                    'Panel': 'VA curvo 1000R',
                    'Tasa de refresco': '144 Hz',
                    'Tiempo respuesta': '1 ms MPRT',
                    'HDR': 'HDR10',
                    'Sync': 'AMD FreeSync Premium',
                    'Entradas': 'DisplayPort 1.2, HDMI 1.4 × 2',
                },
            },
            {
                name: 'Monitor Gamer ASUS TUF VG27AQ',
                description: 'El ASUS TUF Gaming VG27AQ es un monitor IPS de 27" QHD diseñado para dominar juegos competitivos. El panel IPS ofrece colores vibrantes y ángulos de visión amplios de 178°/178°, ventaja clave sobre paneles VA. La tasa de refresco de 165 Hz (overclockeable desde 144 Hz) junto con G-SYNC Compatible y FreeSync Premium garantiza fluidez total. La tecnología ELMB (Extreme Low Motion Blur) puede activarse simultáneamente con FreeSync.',
                brand: 'ASUS',
                color: 'Negro',
                price: 1450000,
                stock: 22,
                categoryId: categories[4].id,
                featured: true,
                supplier: 'ASUS Colombia',
                specifications: {
                    'Tamaño': '27 pulgadas',
                    'Resolución': 'QHD 2560 × 1440',
                    'Panel': 'IPS',
                    'Tasa de refresco': '165 Hz',
                    'Tiempo respuesta': '1 ms MPRT',
                    'HDR': 'HDR10',
                    'Sync': 'G-SYNC Compatible + FreeSync Premium',
                    'Entradas': 'DisplayPort 1.2, HDMI 2.0 × 2',
                    'Ángulos visión': '178° / 178°',
                },
            },

            // ── CELULARES ─────────────────────────────────────────────────────
            {
                name: 'Samsung Galaxy S24 Ultra',
                description: 'El Samsung Galaxy S24 Ultra es la cima de la tecnología móvil para gaming y productividad. El procesador Snapdragon 8 Gen 3 for Galaxy, optimizado específicamente para este dispositivo, ofrece un rendimiento CPU y GPU sin precedentes en Android. La pantalla Dynamic AMOLED 2X de 6.8" con 120 Hz adaptativos brinda colores perfectos bajo cualquier condición lumínica. La batería de 5000 mAh con carga de 45W y carga inalámbrica de 15W asegura autonomía de día completo.',
                brand: 'Samsung',
                color: 'Titanio Negro',
                price: 5200000,
                originalPrice: 5999000,
                discountPercentage: 13,
                stock: 30,
                categoryId: categories[5].id,
                featured: true,
                supplier: 'Samsung Electronics Colombia',
                specifications: {
                    'Procesador': 'Snapdragon 8 Gen 3 for Galaxy',
                    'RAM': '12 GB',
                    'Almacenamiento': '256 GB / 512 GB',
                    'Pantalla': '6.8" Dynamic AMOLED 2X 120 Hz',
                    'Cámara principal': '200 MP f/1.7',
                    'Cámara frontal': '12 MP',
                    'Batería': '5000 mAh — carga 45W',
                    'OS': 'Android 14 — One UI 6.1',
                    'S Pen': 'Incluido',
                },
            },
            {
                name: 'Xiaomi 14T Pro',
                description: 'El Xiaomi 14T Pro lleva el rendimiento de gama alta a un precio imbatible. Equipado con el procesador MediaTek Dimensity 9300+ de 4 nm, ofrece un desempeño en gaming móvil que rivaliza con los mejores del mercado. La pantalla AMOLED de 6.67" con 144 Hz y HDR10+ garantiza imágenes fluidas y vibrantes en juegos. El sistema de enfriamiento de cámara de vapor de gran área mantiene la temperatura bajo control en sesiones intensas.',
                brand: 'Xiaomi',
                color: 'Negro',
                price: 2800000,
                stock: 38,
                categoryId: categories[5].id,
                featured: false,
                supplier: 'Xiaomi Latam',
                specifications: {
                    'Procesador': 'MediaTek Dimensity 9300+',
                    'RAM': '12 GB',
                    'Almacenamiento': '256 GB',
                    'Pantalla': '6.67" AMOLED 144 Hz HDR10+',
                    'Cámara principal': '50 MP Leica — triple sistema',
                    'Batería': '5000 mAh — carga 120W',
                    'OS': 'Android 14 — HyperOS',
                    'Conectividad': '5G, WiFi 7, Bluetooth 5.4',
                },
            },

            // ── MONITORES MSI / ACER ──────────────────────────────────────────
            {
                name: 'Monitor Gamer MSI Optix MAG274QRF',
                description: 'El MSI Optix MAG274QRF es un monitor IPS QHD de 27" diseñado para la élite del gaming competitivo. Con 165 Hz de tasa de refresco y 1 ms de tiempo de respuesta IPS, elimina el ghosting incluso en los juegos más vertiginosos. La tecnología Rapid IPS combina la velocidad de los paneles TN con los colores vibrantes de IPS. Compatible con AMD FreeSync Premium y certificado como G-SYNC Compatible para cero tearing garantizado.',
                brand: 'MSI',
                color: 'Negro',
                price: 1350000,
                originalPrice: 1599000,
                discountPercentage: 16,
                stock: 18,
                categoryId: categories[4].id,
                featured: true,
                supplier: 'MSI Colombia',
                specifications: {
                    'Tamaño': '27 pulgadas',
                    'Resolución': 'QHD 2560 × 1440',
                    'Panel': 'Rapid IPS',
                    'Tasa de refresco': '165 Hz',
                    'Tiempo respuesta': '1 ms GTG',
                    'HDR': 'HDR Ready',
                    'Sync': 'FreeSync Premium / G-SYNC Compatible',
                    'Entradas': 'DisplayPort 1.2a, HDMI 2.0b × 2, USB 3.2 Hub',
                },
            },
            {
                name: 'Monitor Acer Nitro VG271U',
                description: 'El Acer Nitro VG271U ofrece la combinación perfecta entre resolución QHD y alta velocidad de refresco para quienes quieren calidad visual sin sacrificar rendimiento competitivo. El panel IPS de 27" muestra colores fieles con una cobertura del 95% del espacio DCI-P3. La tecnología Visual Response Boost (VRB) reduce el motion blur percibido a un equivalente de 0.5 ms. El diseño ZeroFrame aprovecha al máximo el espacio de pantalla.',
                brand: 'Acer',
                color: 'Negro',
                price: 1190000,
                stock: 24,
                categoryId: categories[4].id,
                featured: false,
                supplier: 'Acer Colombia',
                specifications: {
                    'Tamaño': '27 pulgadas',
                    'Resolución': 'QHD 2560 × 1440',
                    'Panel': 'IPS ZeroFrame',
                    'Tasa de refresco': '144 Hz',
                    'Tiempo respuesta': '1 ms VRB',
                    'Color': '95% DCI-P3',
                    'Sync': 'AMD FreeSync Premium',
                    'Entradas': 'DisplayPort 1.2, HDMI 2.0 × 2',
                },
            },

            // ── LAPTOPS ───────────────────────────────────────────────────────
            {
                name: 'Laptop Gamer ASUS ROG Strix G16',
                description: 'La ASUS ROG Strix G16 es una bestia del gaming portátil. El procesador Intel Core i7-13650HX con 14 núcleos, combinado con la NVIDIA GeForce RTX 4070 de 8 GB GDDR6, entrega FPS altísimos en cualquier título AAA. La pantalla QHD 240 Hz con tecnología ROG Nebula Display y tiempo de respuesta de 3 ms ofrece una experiencia visual sin igual. El sistema de enfriamiento ROG Intelligent Cooling con 4 salidas de calor mantiene la GPU y CPU bajo temperatura óptima en gaming prolongado.',
                brand: 'ASUS',
                color: 'Negro',
                price: 6800000,
                originalPrice: 7999000,
                discountPercentage: 15,
                stock: 10,
                categoryId: categories[6].id,
                featured: true,
                supplier: 'ASUS Colombia',
                specifications: {
                    'Procesador': 'Intel Core i7-13650HX',
                    'GPU': 'NVIDIA RTX 4070 8 GB',
                    'RAM': '16 GB DDR5 4800 MHz',
                    'Almacenamiento': 'SSD NVMe 1 TB PCIe 4.0',
                    'Pantalla': '16" QHD 240 Hz 3 ms',
                    'Batería': '90 Wh — carga 240W',
                    'SO': 'Windows 11 Home',
                    'Peso': '2.5 kg',
                },
            },
            {
                name: 'Laptop Gamer Acer Predator Helios Neo 16',
                description: 'La Acer Predator Helios Neo 16 demuestra que el gaming de alto rendimiento no tiene que romper el banco. Con el procesador Intel Core i7-13700HX de 16 núcleos y la NVIDIA GeForce RTX 4060, maneja todos los títulos AAA modernos con comodidad. La pantalla IPS de 16" WUXGA con 165 Hz y cobertura del 100% sRGB ofrece una experiencia visual inmersiva. El teclado retroiluminado RGB de 4 zonas con teclado numérico completo es ideal tanto para gaming como para trabajo.',
                brand: 'Acer',
                color: 'Azul',
                price: 5900000,
                originalPrice: 6999000,
                discountPercentage: 16,
                stock: 12,
                categoryId: categories[6].id,
                featured: true,
                supplier: 'Acer Colombia',
                specifications: {
                    'Procesador': 'Intel Core i7-13700HX (16 núcleos)',
                    'GPU': 'NVIDIA RTX 4060 8 GB',
                    'RAM': '16 GB DDR5',
                    'Almacenamiento': 'SSD NVMe 512 GB + slot HDD',
                    'Pantalla': '16" WUXGA IPS 165 Hz 100% sRGB',
                    'Batería': '76 Wh — carga 180W',
                    'SO': 'Windows 11 Home',
                    'Peso': '2.6 kg',
                },
            },
            {
                name: 'HP OMEN 16 Gaming Laptop',
                description: 'El HP OMEN 16 es la propuesta gaming de HP para quienes exigen rendimiento sin compromisos. Equipado con el procesador AMD Ryzen 7 7745HX y la GPU NVIDIA RTX 4070, es capaz de correr cualquier juego en resolución Full HD a más de 144 FPS con ajustes ultra. El display IPS de 16.1" con 144 Hz y tiempo de respuesta de 7 ms ofrece imágenes fluidas. OMEN Gaming Hub permite controlar temperatura, frecuencia del ventilador y overclocking desde un solo lugar.',
                brand: 'HP',
                color: 'Negro',
                price: 6500000,
                stock: 9,
                categoryId: categories[6].id,
                featured: false,
                supplier: 'HP Colombia',
                specifications: {
                    'Procesador': 'AMD Ryzen 7 7745HX',
                    'GPU': 'NVIDIA RTX 4070 8 GB',
                    'RAM': '16 GB DDR5 4800 MHz',
                    'Almacenamiento': 'SSD NVMe 1 TB PCIe 4.0',
                    'Pantalla': '16.1" FHD IPS 144 Hz',
                    'Batería': '83 Wh — carga 230W',
                    'SO': 'Windows 11 Home',
                    'Peso': '2.45 kg',
                    'Software': 'OMEN Gaming Hub',
                },
            },
            {
                name: 'Laptop MSI Katana 15',
                description: 'La MSI Katana 15 es la laptop gamer de entrada a la línea MSI que no decepciona. El procesador Intel Core i5-12450H y la GPU NVIDIA GeForce RTX 4060 ofrecen FPS sostenidos en títulos populares como Fortnite, Apex Legends y League of Legends. La pantalla FHD de 15.6" a 144 Hz es ideal para gaming fluido. El diseño de la Katana incluye el exclusivo sistema de ventilación Cooler Boost 5 con doble ventilador y 5 tubos de calor.',
                brand: 'MSI',
                color: 'Negro',
                price: 4800000,
                originalPrice: 5499000,
                discountPercentage: 13,
                stock: 15,
                categoryId: categories[6].id,
                featured: false,
                supplier: 'MSI Colombia',
                specifications: {
                    'Procesador': 'Intel Core i5-12450H',
                    'GPU': 'NVIDIA RTX 4060 8 GB',
                    'RAM': '16 GB DDR5',
                    'Almacenamiento': 'SSD NVMe 512 GB',
                    'Pantalla': '15.6" FHD IPS 144 Hz',
                    'Batería': '52.4 Wh',
                    'SO': 'Windows 11 Home',
                    'Cooling': 'Cooler Boost 5',
                    'Peso': '2.25 kg',
                },
            },
            {
                name: 'Lenovo LOQ 15',
                description: 'La Lenovo LOQ 15 nació para hacerle gaming accesible a todos sin sacrificar rendimiento. Con el procesador AMD Ryzen 5 7640H y la GPU NVIDIA GeForce RTX 4060, maneja títulos como Fortnite, Valorant y CS2 a más de 144 FPS en resolución Full HD con ajustes altos. La pantalla IPS de 144 Hz reduce el motion blur y la fatiga visual. El diseño termal con dos ventiladores y 4 tubos de calor mantiene los componentes frescos sin ruidos excesivos.',
                brand: 'Lenovo',
                color: 'Gris',
                price: 4200000,
                stock: 18,
                categoryId: categories[6].id,
                featured: false,
                supplier: 'Lenovo Colombia',
                specifications: {
                    'Procesador': 'AMD Ryzen 5 7640H',
                    'GPU': 'NVIDIA RTX 4060 8 GB',
                    'RAM': '16 GB DDR5',
                    'Almacenamiento': 'SSD NVMe 512 GB',
                    'Pantalla': '15.6" FHD IPS 144 Hz',
                    'Batería': '60 Wh',
                    'SO': 'Windows 11 Home',
                    'Peso': '2.4 kg',
                },
            },

            // ── ACCESORIOS ────────────────────────────────────────────────────
            {
                name: 'Micrófono USB HyperX SoloCast',
                description: 'El HyperX SoloCast es el micrófono USB plug-and-play ideal para streamers y gamers que buscan calidad de audio profesional sin complicaciones. El patrón polar cardioide capta tu voz con precisión y atenúa ruidos laterales como ventiladores o personas hablando al fondo. El condensador interno ofrece una respuesta en frecuencia plana entre 20 Hz y 20 kHz. El toque tap-to-mute con LED de estado hace el silenciado instantáneo.',
                brand: 'HyperX',
                color: 'Negro',
                price: 250000,
                originalPrice: 299000,
                discountPercentage: 16,
                stock: 55,
                categoryId: categories[6].id,
                featured: false,
                supplier: 'HP/HyperX Colombia',
                specifications: {
                    'Tipo': 'Condensador USB',
                    'Patrón polar': 'Cardioide',
                    'Respuesta en frecuencia': '20 Hz – 20 kHz',
                    'Tasa de muestreo': '96 kHz / 24 bit',
                    'Conexión': 'USB-A',
                    'Mute': 'Tap-to-mute con LED',
                    'Montura': 'Escritorio + clip universal',
                },
            },
            {
                name: 'Webcam Logitech C922 Pro Stream',
                description: 'La Logitech C922 Pro Stream es la webcam predilecta de streamers y creadores de contenido. Captura video Full HD 1080p a 30 fps o HD 720p a 60 fps para una transmisión fluida. El dual micrófono estéreo omnidireccional captura sonido natural en un rango de 90°. Incluye licencia de 3 meses para XSplit Broadcaster y soporte nativo para OBS, Streamlabs y YouTube.',
                brand: 'Logitech',
                color: 'Negro',
                price: 420000,
                stock: 33,
                categoryId: categories[6].id,
                featured: false,
                supplier: 'Logitech Colombia S.A.S.',
                specifications: {
                    'Resolución video': '1080p 30fps / 720p 60fps',
                    'Ángulo de visión': '78°',
                    'Micrófono': 'Estéreo omnidireccional dual',
                    'Enfoque': 'Automático',
                    'Conexión': 'USB-A',
                    'Compatible con': 'OBS, Streamlabs, XSplit, Teams, Zoom',
                    'Trípode': 'Incluido',
                },
            },
            {
                name: 'Silla Gamer Cougar Armor One',
                description: 'La Cougar Armor One es una silla gamer de diseño agresivo y ergonomía superior. El respaldo reclinable hasta 180° y los reposabrazos 3D totalmente ajustables se adaptan a cualquier postura. El relleno de espuma de alta densidad moldeable retiene la forma después de miles de horas de uso. La base de nailon de 5 estrellas con ruedas de poliuretano silenciosas garantiza una movilidad suave sobre cualquier piso. El soporte lumbar y el cojín cervical extraíbles son ajustables independientemente.',
                brand: 'Cougar',
                color: 'Naranja',
                price: 850000,
                originalPrice: 999000,
                discountPercentage: 15,
                stock: 14,
                categoryId: categories[6].id,
                featured: false,
                supplier: 'Cougar Distribuciones Colombia',
                specifications: {
                    'Reclinación': 'Hasta 180°',
                    'Reposabrazos': '3D ajustables',
                    'Relleno': 'Espuma alta densidad',
                    'Base': 'Nailon 5 estrellas',
                    'Ruedas': 'Poliuretano silencioso',
                    'Carga máx.': '120 kg',
                    'Altura asiento': '43 – 53 cm ajustable',
                    'Soporte lumbar': 'Extraíble + ajustable',
                },
            },
        ]);
        console.log('📦 Productos creados');

        // 3 imágenes por producto para el carrusel del detalle
        const extraImages = {
            'mouse':    ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80'],
            'teclado':  ['https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=80', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80'],
            'auricular':['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', 'https://images.unsplash.com/photo-1491927570842-0261e477d937?w=800&q=80'],
            'mousepad': ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
            'monitor':  ['https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800&q=80', 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&q=80'],
            'celular':  ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80', 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80'],
            'laptop':   ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80', 'https://images.unsplash.com/photo-1611186871525-a4d2d29823fa?w=800&q=80'],
            'microfono':['https://images.unsplash.com/photo-1478737270197-5eac1e61c697?w=800&q=80', 'https://images.unsplash.com/photo-1520166012956-add9ba0835cb?w=800&q=80'],
            'webcam':   ['https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80'],
            'silla':    ['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80'],
            'default':  ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80', 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800&q=80'],
        };

        function getPrimaryImage(name) {
            const n = name.toLowerCase();
            if (n.includes('mouse') || n.includes('ratón') || n.includes('raton')) return 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80';
            if (n.includes('teclado') || n.includes('keyboard')) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80';
            if (n.includes('auricular') || n.includes('headset') || n.includes('audifo')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
            if (n.includes('mousepad') || n.includes('alfombra')) return 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=800&q=80';
            if (n.includes('monitor') || n.includes('pantalla')) return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80';
            if (n.includes('samsung') || n.includes('xiaomi') || n.includes('celular')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80';
            if (n.includes('laptop') || n.includes('portatil') || n.includes('notebook') || n.includes('rog') || n.includes('lenovo') || n.includes('asus')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80';
            if (n.includes('microfono') || n.includes('mic') || n.includes('solocast')) return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80';
            if (n.includes('webcam') || n.includes('camara')) return 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80';
            if (n.includes('silla') || n.includes('chair') || n.includes('cougar')) return 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80';
            return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80';
        }

        function getExtraImages(name) {
            const n = name.toLowerCase();
            if (n.includes('mouse') || n.includes('raton')) return extraImages['mouse'];
            if (n.includes('teclado') || n.includes('keyboard')) return extraImages['teclado'];
            if (n.includes('auricular') || n.includes('headset')) return extraImages['auricular'];
            if (n.includes('mousepad')) return extraImages['mousepad'];
            if (n.includes('monitor')) return extraImages['monitor'];
            if (n.includes('samsung') || n.includes('xiaomi') || n.includes('celular')) return extraImages['celular'];
            if (n.includes('laptop') || n.includes('portatil') || n.includes('rog') || n.includes('lenovo')) return extraImages['laptop'];
            if (n.includes('microfono') || n.includes('solocast')) return extraImages['microfono'];
            if (n.includes('webcam')) return extraImages['webcam'];
            if (n.includes('silla')) return extraImages['silla'];
            return extraImages['default'];
        }

        const productImageRows = products.flatMap((product) => {
            const primary = getPrimaryImage(product.name);
            const [extra1, extra2] = getExtraImages(product.name);
            return [
                { productId: product.id, imageUrl: primary, sortOrder: 0, isPrimary: true },
                { productId: product.id, imageUrl: extra1, sortOrder: 1, isPrimary: false },
                { productId: product.id, imageUrl: extra2, sortOrder: 2, isPrimary: false },
            ];
        });
        await ProductImage.bulkCreate(productImageRows);

        // Actualizar imageUrl principal de cada producto
        await Promise.all(products.map(p => p.update({ imageUrl: getPrimaryImage(p.name) })));

        console.log('🖼️  Imágenes de productos creadas (3 por producto)');

        await Wishlist.bulkCreate([
            { userId: customer1.id, productId: products[0].id },
            { userId: customer1.id, productId: products[6].id },
            { userId: customer2.id, productId: products[1].id },
            { userId: customer2.id, productId: products[11].id },
        ]);
        console.log('❤️  Favoritos creados');

        // ==================== ÓRDENES DE EJEMPLO ====================
        const order1 = await Order.create({
            userId: customer1.id,
            orderNumber: 'PED-000001-SEED01',
            total: 1120000,
            status: 'entregado',
            shippingAddress: 'Carrera 10 #20-30, Medellín, Antioquia',
        });
        await OrderItem.bulkCreate([
            { orderId: order1.id, productId: products[0].id, quantity: 1, unitPrice: products[0].price },
            { orderId: order1.id, productId: products[9].id, quantity: 2, unitPrice: products[9].price },
        ]);
        await Payment.create({ orderId: order1.id, amount: 1120000, method: 'pse', status: 'aprobado', transactionId: 'TXN-SEED-001' });

        const order2 = await Order.create({
            userId: customer1.id,
            orderNumber: 'PED-000002-SEED02',
            total: 1360000,
            status: 'enviado',
            shippingAddress: 'Carrera 10 #20-30, Medellín, Antioquia',
        });
        await OrderItem.bulkCreate([
            { orderId: order2.id, productId: products[11].id, quantity: 1, unitPrice: products[11].price },
            { orderId: order2.id, productId: products[3].id, quantity: 1, unitPrice: products[3].price },
        ]);
        await Payment.create({ orderId: order2.id, amount: 1360000, method: 'contraentrega', status: 'aprobado', transactionId: 'TXN-SEED-002' });

        const order3 = await Order.create({
            userId: customer2.id,
            orderNumber: 'PED-000003-SEED03',
            total: 960000,
            status: 'procesando',
            shippingAddress: 'Avenida 5 #15-25, Cali, Valle del Cauca',
        });
        await OrderItem.bulkCreate([
            { orderId: order3.id, productId: products[7].id, quantity: 1, unitPrice: products[7].price },
            { orderId: order3.id, productId: products[14].id, quantity: 1, unitPrice: products[14].price },
        ]);
        await Payment.create({ orderId: order3.id, amount: 960000, method: 'pse', status: 'aprobado', transactionId: 'TXN-SEED-003' });

        console.log('📋 Órdenes de ejemplo creadas');

        console.log('\n============================================');
        console.log('✅ SEED COMPLETADO EXITOSAMENTE');
        console.log('============================================');
        console.log('\n📌 Credenciales de prueba:');
        console.log('   Admin:    davidcito01012002@gmail.com / 409KL00c.');
        console.log('   Cliente1: carlos@email.com / password123');
        console.log('   Cliente2: maria@email.com / password123');
        console.log('============================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en el seed:', error);
        process.exit(1);
    }
};

seed();
