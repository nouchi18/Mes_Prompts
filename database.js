const promptDatabase = [
    {
        title: "CINEMATIC",
        styles: "portraits caricatures femmes",
        img: "Images/Gemini_Generated_Image_44306f44306f4430.png",
        prompt: `Créez un portrait caricatural 3D exagéré et stylisé à partir de la personne figurant sur la photo de référence ci-jointe. Conservez l'identité du sujet, les traits de son visage, son teint et ses caractéristiques distinctives, mais réinterprète-les sous la forme d'une caricature 3D audacieuse.
Appliquez une déformation forte et intentionnelle, notamment un cou allongé, un rapport tête-cou surdimensionné, des paupières tombantes, des lèvres épaisses et une asymétrie faciale subtile. Le personnage doit rester humain tout en étant clairement stylisé et expressif.
Utilisez une finition de surface propre et contrôlée avec une peau lisse de qualité studio. Évitez les textures aléatoires, les imperfections, les taches de rousseur, la saleté, le grain, les mouchetures ou le bruit. Les matériaux doivent paraître polis, haut de gamme et soigneusement conçus, avec une diffusion subtile sous la surface et un ombrage réaliste de la peau.
Habillez le personnage avec des vêtements de luxe et des accessoires audacieux et haut de gamme, créant ainsi une esthétique étrange, avant-gardiste et collectionnable qui semble dictée par le personnage plutôt que mignonne ou réaliste.
Éclairez la scène avec un éclairage de studio neutre, des ombres douces et diffuses, et un éclairage uniforme sans contraste marqué. Utilisez un fond gris neutre uni ou blanc cassé.
Effectuez le rendu en qualité 4K ultra haute définition avec des détails extrêmes, une mise au point nette et une clarté cinématographique. Incluez des détails de micro-surface, des textures haute résolution, un rendu physique (PBR), un éclairage global, des reflets doux et une définition raffinée des matériaux. L'image doit être nette, propre et sans bruit, avec une qualité de rendu professionnelle en studio.
Pas de texte, de logos ou de filigranes.
Format d'image : 2/3.`
    },
    {
        title: "PORTRAIT",
        styles: "portraits cinematiques femmes",
        img: "https://nouchi18.github.io/Mes_Prompts/Images/10683.png",
        prompt: `Description Générale : Photographie de mode éditoriale, esthétique glamour et luxueuse, mettant en scène une jeune femme dans une boutique de luxe minimaliste.

1. Sujet & Apparence
Modèle : Jeune femme à la posture élégante et assurée. Cheveux longs, châtains, coiffés en ondulations "Hollywood Waves" avec une raie prononcée à droite.

Make-up : Maquillage sophistiqué de type "Glam Look". Teint parfait, regard défini (smoky léger), et lèvres finies en vin mat profond.

Visage : [CONSERVER LES TRAITS ORIGINAUX DU VISAGE - NE PAS MODIFIER].

2. Tenue & Accessoires
Vêtement : Mini-robe bustier (strapless) entièrement recouverte de sequins rouges scintillants. Bustier ajusté et jupe structurée à volants superposés pour un effet de volume et de texture.

Bijoux : Ensemble de bijoux "statement" en argent poli. Choker à maillons épais de style industriel-luxe, bracelets manchettes assortis sur les deux poignets.

Accessoire phare : Sac à main de luxe au premier plan, cuir rouge cerise brillant, motif surpiqué cannage iconique, avec charms métalliques polis suspendus à la poignée.

3. Environnement & Composition
Décor : Intérieur de boutique de luxe minimaliste. Sol en marbre de Carrare blanc poli avec reflets spéculaires.

Profondeur de champ : Arrière-plan avec présentoirs flous (bokeh artistique) pour créer une isolation du sujet et une sensation d'espace haut de gamme.

Cadrage : Plan moyen (medium shot) mettant l'accent sur la silhouette et les accessoires.

4. Éclairage & Technique
Lumière : Éclairage de studio de mode, doux et frontal (type "Beauty Dish"). Accentuation des hautes lumières sur les sequins pour créer du scintillement.

Qualité d'image : Haute définition, grain de peau photoréaliste, rendu 8K, texture de tissu détaillée.

Style visuel : Esthétique Vogue / Harper’s Bazaar.

5. Paramètres Techniques
Format de l'image : 2:3.

Négatif prompt conseillé : (déformations, traits du visage modifiés, flou de bougé, mauvaise anatomie).`
    },
    {
        title: "PORTRAIT SPORT",
        styles: "portraits sports femmes",
        img: "Images/10688.png",
        prompt: `Description Générale : Photographie de sport d'élite capturant un instant de triomphe absolu lors d'une finale européenne. 👤 Sujet & Portrait Personnage : Femme athlète à la musculature définie, expression de joie extatique, sourire authentique et émotionnel. Référence Visuelle : Utiliser l'image source pour la structure faciale et les traits distinctifs (Face Match). Détails de la Peau : Texture de peau ultra-détaillée (pores visibles), perles de sueur réalistes, légères traces de terre et d'herbe sur les bras et le visage. Posture : Dynamisme "action-freeze", bras levés en V, célébration iconique. 👕 Tenue & Équipement Maillot : Kit domicile officiel du Real Madrid (blanc pur avec finitions dorées). Détails Techniques : Texture de tissu respirant (mesh), blason du club brodé en relief, logo Adidas précis, plis naturels dus au mouvement. 🏟️ Scène & Environnement Contexte : Pelouse luxuriante d'un stade de renommée mondiale, perspective au niveau du sol. Arrière-plan : Coéquipiers en mouvement (flou cinétique), foule en liesse créant un bokeh crémeux. Éléments Particulaires : Pluie fine rétroéclairée, confettis dorés et blancs flottant dans l'air, brume de stade légère. 💡 Éclairage & Atmosphère Style Lumineux : Éclairage de stade dramatique, contre-jour puissant créant un Rim Light (halo de lumière) sur les contours du sujet. Ambiance : Héroïque, cinématographique, intensité d'une finale de Ligue des Champions. Couleurs : Étalonnage type documentaire sportif haut de gamme, contraste élevé, blancs éclatants et verts profonds. ⚙️ Paramètres Techniques (DSLR) Objectif : Téléobjectif 85mm (idéal pour le portrait sportif). Ouverture : f/1.8 (faible profondeur de champ, isolation parfaite du sujet). Rendu : Plage dynamique élevée (HDR), piqué d'image chirurgical (sharp focus), 8K, photoréalisme absolu. Format d'image : Aspect Ratio 2:3 (--ar 2:3).`
    },
    {
        title: "PORTRAIT CARICATURE",
        styles: "portraits femmes",
        img: "https://images.unsplash.com/photo-1564430003026-02ee4892ec8d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        prompt: `Créez un portrait caricatural 3D exagéré et stylisé à partir de la personne figurant sur la photo de référence ci-jointe. Conservez l'identité du sujet, les traits de son visage, son teint et ses caractéristiques distinctives, mais réinterprète-les sous la forme d'une caricature 3D audacieuse... (Identique au premier prompt).`
    },
    {
        title: "PORTRAIT FASHION CHAT",
        styles: "portraits fashions hommes",
        img: "Images/10701.png",
        prompt: `🏷️ Sujet & Personnages
Modèle : Mannequin homme à l'allure élégante et charismatique. Teint de peau impeccable, pose confiante et statutaire.
Attitude : Le mannequin caresse doucement la tête d'un chat géant avec une main délicatement posée sur son cou, exprimant un mélange de puissance souveraine et de tendresse émotionnelle.
Le Compagnon : Un chat noir colossal aux proportions de panthère majestueuse. Pelage de jais profond, yeux perçants, posture calme et protectrice.
👗 Garde-robe & Style (Stylisme)
Tenue : Costume long sur mesure de couleur Rouge Cerise, incluant un manteau allongé à la structure nette (sharp tailoring) et à la fluidité élégante. Tissu premium présentant des reflets satinés subtils.
Accessoires : Lunettes de soleil rectangulaires opaques de couleur cerise assorties, renforçant l'esthétique monochrome audacieuse.
Esthétique : Look monochrome d'avant-garde, luxe minimaliste.
🌲 Environnement & Scène (Set Design)
Arrière-plan : Forêt surréaliste composée d'arbres géants stylisés aux feuilles rouge cramoisi massif.
Sol : Texture de sol en velours rouge profond, créant une continuité organique avec le décor.
Atmosphère : Profondeur atmosphérique avec une légère brume (haze) pour séparer les plans.
💡 Éclairage & Optique
Lumière : Éclairage directionnel doux de type "Key Light" sur les sujets. Utilisation d'une Rim Light (lumière de contour) subtile pour détacher les silhouettes noires et rouges du fond cramoisi.
Ombres : "Soft falloff" (dégradé d'ombres doux) pour un rendu cinématographique.
Objectif : Rendu moyen format (Phase One/Hasselblad), faible profondeur de champ (f/2.8) pour un bokeh crémeux sur la forêt.
📸 Spécifications Techniques
Format d'image : 2/3
Style : Photographie éditoriale de mode, campagne de luxe haute couture.
Rendu : Textures ultra-détaillées (grain du tissu, pelage du chat), étalonnage colorimétrique cinématographique (color grading), 8k, photoréalisme riche.`
    },
    {
        title: "PORTRAIT CAMOMILLE",
        styles: "portraits femmes",
        img: "Images/10729.png",
        prompt: `Directives Générales : Générer une image haute fidélité en conservant une cohérence stricte avec les traits du visage et l'identité de l'image de référence fournie.
👤 Sujet et Pose
Personnage : Une femme éblouissante avec une coupe au carré (bob cut) moderne, déstructurée et texturée.
Action : Capturée en plein élan, courant avec dynamisme à travers un champ dense de camomilles.
Angle de vue : Vue de dos (three-quarter back view). Elle tourne la tête par-dessus son épaule vers l'objectif dans un mouvement fluide.
Expression : Sourire radieux et spontané, regard pétillant, capturant un instant de pure joie et de liberté.
Tenue : Une robe d'été légère qui flotte et ondule sous l'effet de la course et du vent.
🌿 Environnement et Atmosphère
Scène : Un champ de camomilles à perte de vue, fleurs blanches et cœurs jaunes créant un tapis floral texturé.
Météo : Chaleur estivale palpable, atmosphère vaporeuse et romantique.
Dynamique : Effet de vent prononcé dans les cheveux et dans le tissu de la robe pour accentuer le mouvement.
💡 Éclairage et Colorimétrie
Lumière : "Golden Hour" (Heure dorée) intense. Rétroéclairage (backlighting) créant un halo lumineux autour de la silhouette et des cheveux (rim light).
Teintes : Palettes chaudes, tons ambrés, dorés et orangés contrastant avec le blanc pur des fleurs.
Rendu : Flare d'objectif subtil (lens flare) pour renforcer le côté naturel et cinématographique.
📸 Paramètres Techniques (Rendu Photographique)
Appareil : Canon EOS R5, rendu plein format (Full Frame).
Objectif : 50mm f/1.8 (focale fixe standard pour un rendu naturel).
Profondeur de champ : Très faible (bokeh prononcé), l'arrière-plan floral est artistiquement flouté pour isoler le sujet.
Exposition : Vitesse d'obturation rapide (1/1000s) pour figer le mouvement des fleurs et des cheveux avec une netteté cristalline. ISO 100 pour une absence totale de grain numérique.
🖼️ Format et Style
Format d'image : Aspect Ratio 2:3 (Portrait vertical).
Style visuel : Photographie de mode lifestyle, esthétique cinématographique "Raw" (authentique et non retouchée de manière artificielle).`
    },
    {
        title: "PORTRAIT BIKER CHIC",
        styles: "portraits femmes fashions",
        img: "Images/8878.png",
        prompt: `Sujet et Pose
Modèle : Conserver l'identité faciale originale sans aucune altération des traits.
Pose : Pose dynamique, accroupie (crouching) de profil. Rotation du buste et du cou pour un regard intense "par-dessus l'épaule" dirigé vers l'objectif.
Cheveux : Coiffure "Blond Cendré" (Ash Blonde), longues boucles volumineuses, texture "beachy waves" ébouriffée tombant en cascade sur le dos.
Scène et Stylisme
Style : Fusion "Biker Chic" structurel et "Parisian Chic" minimaliste. Esthétique avant-gardiste et éditoriale.
Tenue : Blazer blanc structuré oversize à épaulettes marquées (power shoulders), cintré par une large ceinture corset blanche assortie.
Bas : Collants blancs transparents (sheer) montant jusqu'aux cuisses (thigh-high), esprit haute couture.
Chaussures : Escarpins blancs classiques à bout pointu (stiletto pumps).
Environnement et Composition
Arrière-plan : Studio professionnel avec mur cyclorama (Cyc-wall) gris mat, sans couture, fini minimaliste.
Cadrage : Composition centrée, sujet net. Utilisation d'un large espace négatif (negative space) pour accentuer la silhouette et l'épure de la scène.
Éclairage et Colorimétrie
Lumière : Éclairage de studio diffus (softbox large). Présence d'un "Rim Light" (éclairage de contour) subtil on la chevelure. Dégradé d'ombres douces (soft drop shadows) sur le sol.
Colorimétrie : Palette de couleurs désaturées ("muted tones"), température froide. Blancs éclatants et gris neutres profonds.
Paramètres Techniques (Rendu Photo)
Optique : Rendu plein format (Full-frame), objectif 85mm f/1.2. Profondeur de champ ultra-courte (shallow depth of field) avec un piqué chirurgical sur le sujet et un flou d'arrière-plan crémeux.
Qualité : Photographie de mode haute résolution, grain de peau naturel, texture textile détaillée, rendu 8k.
Format de l'image : 2:3 (Portrait vertical).`
    },
    {
        title: "PORTRAIT QIPAO LUXE",
        styles: "portraits femmes",
        img: "Images/8875.png",
        prompt: `Sujet & Personnage :
Modèle : Femme élégante à la silhouette voluptueuse et pulpeuse, peau de porcelaine lumineuse et grain de peau ultra-détaillé.
Expression : Regard confiant, charismatique et séduisant dirigé vers l'objectif.
Maquillage : Glamour sophistiqué, rouge à lèvres carmin vibrant, paupières rehaussées de micro-paillettes dorées scintillantes.
Coiffure : Chignons doubles (odango) stylisés avec précision, ornés de bijoux de tête en or et de pompons en soie rouge.
Garde-robe & Accessoires :
Tenue : Cheongsam (Qipao) traditionnel en soie de mûrier rouge intense. Broderies artisanales complexes en fils d'or et champagne. Texture satinée haut de gamme avec reflets spéculaires réalistes.
Accessoire : Éventail pliant rouge de luxe avec monture en bois laqué et détails dorés fins, tenu avec grâce.
Environnement & Composition :
Scène : Intérieur luxueux célébrant le Nouvel An Lunaire. Arrière-plan composé de branches de cerisiers en fleurs et de lanternes rouges suspendues.
Éléments de décor : Table en bois de rose au premier plan (flou d'amorce) avec un bol en céramique fine contenant des mandarines éclatantes.
Composition : Portrait de mode type "Editorial Magazine", cadrage vertical, mise au point sélective sur le visage et les détails de la soie.
Techniques d'Image & Éclairage :
Éclairage : Éclairage cinématographique "Clair-obscur" chaleureux. Lumière de contour (rim light) dorée pour détacher la silhouette. Bokeh sphérique doux créé par les lanternes.
Optique : Objectif 85mm f/1.2, profondeur de champ extrêmement réduite (shallow depth of field).
Rendu : Ultra-réaliste, photoréalisme 8K, texture 4K, netteté chirurgicale sur les yeux et les broderies, rendu Octane, esthétique Vogue.
Format de l'image : 2:3 (Portrait vertical)`
    },
    {
        title: "PORTRAIT DENIM ÉDITO",
        styles: "portraits femmes fashions",
        img: "Images/8873.png",
        prompt: `## Sujet et Portrait
Identité : Photographie de mode haut de gamme (High-End Fashion). Conservation stricte de l’identité visuelle de la femme de l’image de référence (traits faciaux exacts).
Attributs : Expression sereine et calme, lèvres dessinées avec un rouge à lèvres mat profond, longs cheveux lisses et raides (sleek hair).
Tenue : Body bustier (sans bretelles) couleur nude-brun avec dos partiellement dénudé, associé à un jean droit en denim bleu moyen (medium wash).
Accessoires : Grandes boucles d'oreilles vintage argentées, texture métallique réfléchissante.
## Pose et Composition
Pose : Assise pieds nus sur le sol. Main gauche en appui vers l'arrière, une jambe repliée avec élégance et l'autre allongée vers l'avant. Silhouette fluide et décontractée.
Cadrage : Plan moyen (Medium Shot) capturant l'intégralité du corps et l'espace environnant.
Décor : Studio minimaliste, environnement "Pure White" immaculé, esthétique épurée et vide (negative space).
## Éclairage et Style Visuel
Type de Lumière : Éclairage latéral directionnel intense (Hard Side Lighting).
Effets d'Ombre : Ombres portées géométriques nettes et contrastées (Sharp Shadows) se projetant sur le sol et le mur arrière.
Rendu : Esthétique éditoriale moderne, grain de peau naturel et détaillé (Skin Texture), rendu photoréaliste haute définition.
Couleurs : Palette minimaliste dominée par le blanc, le denim bleu et le nude, accentuée par le rouge des lèvres.
## Paramètres Techniques
Format de l'image : 2:3 (Portrait)
Style : Photographie professionnelle au format 35mm, profondeur de champ subtile.`
    },
    {
        title: "PORTRAIT ROUGE CHIAROSCURO",
        styles: "portraits femmes fashions",
        img: "Images/8872.png",
        prompt: `Instructions Principales :
Générer une photographie ultra-réaliste combinant un portrait en gros plan et une vue en pied (full-body shot). Respecter strictement les traits du visage de l'image de référence fournie.
👤 Sujet & Portrait
Modèle : Femme à la silhouette voluptueuse et pulpeuse, posture audacieuse et confiante.
Visage & Expression : Expression provocante, regard intense. Détails de la peau hyper-réalistes (pores visibles, grain de peau naturel, teint éclatant/dewy).
Chevelure : Cheveux ondulés texturés tombant en cascade sur les épaules.
Pose : Légèrement penchée contre un tabouret de bar, jambes croisées, une main posée avec assurance sur la cuisse.
👗 Garde-robe & Accessoires
Tenue : Mini-robe rouge ajustée, motifs floraux complexes et brodés, décolleté élégant, fentes latérales hautes jusqu'aux hanches.
Accessoires : Collier ras-du-cou en or fin, boucles d'oreilles pendantes assorties en or poli.
Chaussures : Escarpins à talons aiguilles noirs vernis (stilettos).
🏛️ Scénographie & Environnement
Lieu : Salon d'un hôtel de luxe (lounge haut de gamme).
Décor : Sol en marbre sombre veiné, accents décoratifs dorés, pétales de rose parsemés au sol.
Ambiance : Atmosphère intime, feutrée et sophistiquée.
💡 Éclairage & Rendu Visuel
Type d'éclairage : Éclairage "Chiaroscuro" (clair-obscur) dramatique et discret (low-key lighting).
Sources : Lueur douce de bougies vacillantes et appliques murales chaleureuses créant des ombres portées intimes.
Technique : Rendu photoréaliste 8k, haute plage dynamique (HDR), profondeur de champ cinématique (bokeh léger en arrière-plan).
📐 Spécifications Techniques
Format d'image (Aspect Ratio) : 2/3
Style : Photographie de mode commerciale / Éditorial luxe.
Finition : Netteté extrême sur les textures textiles et les bijoux.`
    },
    {
        title: "PORTRAIT BARBIECORE 60S",
        styles: "femmes fashions",
        img: "Images/8881.png",
        prompt: `Sujet & Modèle :
Personnage : Femme élégante au look "Barbiecore" vintage.
Pose : Assise de manière dynamique dans un fauteuil, dos incliné vers l'arrière, jambes relevées et allongées, chevilles délicatement croisées.
Expression : Regard direct vers l'objectif, expression de surprise espiègle (playful surprise), bouche légèrement entrouverte.
Garde-robe & Stylisme (Fashion Editorial) :
Haut : Chemisier blanc impeccable à manches bouffantes volumineuses et poignets structurés, surmonté d'un corset rose à motifs ornementaux.
Bas : Collants blancs opaques épais, escarpins à talons ornés de plumes roses vaporeuses.
Accessoires : Multiples rangs de colliers de perles classiques.
Coiffure : Style rétro des années 60, volume généreux, grosses boucles structurées avec des bigoudis roses apparents intégrés à la coiffure.
Objet : Téléphone à cadran vintage blanc avec finitions dorées luxueuses.
Cadre & Décor (Scène) :
Mobilier : Fauteuil pivotant rond en velours rose poudré, texture douce et luxueuse.
Environnement : Studio minimaliste, mur de fond rose vif (Hot Pink) parfaitement lisse, sans texture, créant une esthétique monochrome saturée.
Technique Photographique & Éclairage :
Cadrage : Plan en pied (Full body shot), angle de vue en légère contre-plongée (low angle) pour magnifier la silhouette.
Éclairage : Lumière de studio frontale, douce et enveloppante (high-key lighting), aucune ombre portée dure, rendu "beauté" parfaitement uniforme.
Optique : Rendu net, lignes épurées, style éditorial de magazine de mode haute couture.
Atmosphère & Colorimétrie :
Style : Rétro-glamour des années 60, esthétique publicitaire vintage, mélange d'humour et de sophistication.
Couleurs : Palette de dégradés de roses saturés, blancs éclatants et touches dorées. Correction colorimétrique vibrante et brillante (glossy finish).
Format de l'image : 2:3`
    },
    {
        title: "PORTRAIT COQUETTE PREPPY",
        styles: "portraits femmes",
        img: "Images/8869.png",
        prompt: `Description Générale : Portrait éditorial haute couture d'une femme à la silhouette voluptueuse, capturant une esthétique "Coquette-Preppy" luxueuse et printanière.
👤 Sujet & Portrait
Modèle : Femme voluptueuse et pulpeuse, traits faciaux précis et réalistes (respecter l'identité fournie), teint frais.
Coiffure & Maquillage : Longue chevelure ondulée (beach waves) avec du mouvement ; maquillage "soft glam" naturel, lèvres rosées, grain de peau visible.
Pose : Posture élégante et décontractée, allure de blogueuse mode influente.
👗 Garde-robe (Stylisme)
Haut : Cardigan court (cropped) en maille épaisse vert émeraude foncé, texture tricotée détaillée, fermé par trois nœuds délicats en ruban sur le devant, manches longues.
Bas : Jupe midi plissée à taille haute, dégradé (ombre) de rose pâle, tissu en mousseline de soie vaporeuse avec un effet de mouvement aérien.
Accessoires : * Lunettes de soleil ovales vintage à monture dorée, posées sur la tête, verres teintés rose.
Sac à main de luxe en forme de cœur rose poudré, orné d'un charm miniature vert et doré.
Chaussures : Baskets "lifestyle" haut de gamme, coloris blocs rose pastel et vert menthe.
☕ Scène & Environnement
Lieu : Terrasse d'un café parisien chic ou intérieur de café design avec des touches de marbre et de fleurs.
Composition : Style "Pinterest-ready", cadrage vertical type magazine de mode, profondeur de champ courte (bokeh) pour isoler le sujet de l'arrière-plan.
💡 Éclairage & Esthétique
Lumière : Éclairage doré d'après-midi (Golden Hour doux), lumière diffuse qui accentue les textures de la maille et la transparence de la soie.
Palette de couleurs : Contraste riche entre le vert émeraude profond et la douceur des pastels (rose poudré, vert menthe).
Ambiance : Féminine, romantique, luxueuse, esthétique "soft-girl" haut de gamme.
⚙️ Spécifications Techniques
Modèle : Nano Banana 2 (Gemini 3 Flash Image).
Résolution : Ultra-haute définition 8K, piqué net (sharp focus), rendu photoréaliste.
Format d'image : 2:3 (Aspect Ratio).
Style : Editorial Fashion Photography.`
    }
];