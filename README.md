# Talk It! 💬 Beszélgess amerikai angolul

AI beszélgetőpartner magyar angoltanulóknak (A1, A2, B1). Hangosan beszélsz, az AI tutor hangosan válaszol egyszerű amerikai angolsággal, szerepjátékos szituációkban, és magyarul magyarázza el a hibáidat.

**Élő verzió:** https://sziszko08.github.io/talk-it-english/
Testvér app (szavak, kiejtés): https://sziszko08.github.io/say-it-english/

## Funkciók
- 20 szituáció 3 szinten (A1, A2, B1) + Szabad beszélgetés témaválasztóval
- Beszédfelismerés (en-US), nyomógombos vagy lenyomva tartós mikrofon, kihangosított mód
- Felolvasás a legjobb elérhető amerikai hanggal, sebesség állítható, minden üzenet újra meghallgatható
- „Mit jelent?” gomb: magyar fordítás minden tutor üzenethez
- Javítások magyar magyarázattal, kiejtési tipp, 2 javasolt válasz, ha elakadsz
- Összegzés minden beszélgetés után (új szavak, 3 legfontosabb javítás, tipp), előzmények, haladás, napi sorozat
- **Demo mód** kulcs nélkül: 5 forgatókönyv szerinti szituáció, a kimondott mondatot a várt válaszhoz hasonlítja
- Sötét/világos mód, telepíthető (PWA), billentyűk: M vagy Szóköz = mikrofon

## Indítás
1. Nyisd meg az élő oldalt **Chrome** vagy **Edge** böngészőben (Androidon Chrome, iPhone-on Safari).
2. Engedélyezd a mikrofont, amikor a böngésző kéri.
3. Kulcs nélkül azonnal kipróbálhatod a ⭐ Demo szituációkat.
4. Teljes AI módhoz: ⚙️ Beállítások, válaszd a szolgáltatót, illeszd be a kulcsot, majd „Kapcsolat tesztelése”.

## API kulcs beszerzése (röviden)
- **xAI (Grok):** console.x.ai oldalon regisztrálj, tölts fel egyenleget (Billing), majd az API Keys menüben hozz létre kulcsot (`xai-...`). Végpont: `https://api.x.ai/v1`, modell pl. `grok-4.3`.
- **OpenAI:** platform.openai.com, Billing alatt tölts fel egyenleget, majd API keys, Create new secret key (`sk-...`). Modell: `gpt-4o-mini`.
- **Egyéni:** bármilyen OpenAI-kompatibilis `/chat/completions` végpont, ha engedi a böngészőből érkező kéréseket (CORS).

Egy beszélgetés jellemzően csak néhány forintnyi tokent használ. Állíts be költési limitet a szolgáltatónál.

## Adatvédelem
- A kulcs csak a böngésződ localStorage tárolójában van, közvetlenül a szolgáltatóhoz megy. Nincs saját szerver.
- A beszélgetés **szövege** a választott AI szolgáltatóhoz kerül. A beszédfelismerést a böngésző végzi (Chrome esetén a Google szerverein).
- Közös gépen használat után töröld a kulcsot (Beállítások, Kulcs törlése).

## Helyi futtatás
A mikrofon csak **https** vagy **localhost** alatt működik:
```
python3 -m http.server 8000
```
Majd: http://localhost:8000

## Telepítés (deploy)
Statikus fájlok, build nélkül. GitHub Pages (Settings, Pages, main ág gyökere), Netlify Drop vagy bármilyen https tárhely.

## Korlátok
- Pontos kiejtés pontszám nem lehetséges böngészőből: a felismerés megbízhatóságát mutatjuk (ha a böngésző megadja), Demo módban pedig a várt mondattól eltérő szavakat.
- Firefox nem támogatja a beszédfelismerést: ott gépelve lehet válaszolni.
