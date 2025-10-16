# Testing Guide - 24-urenloop Board

## 🧪 Server Unit Tests

### Run tests

```bash
cd server
npm test
```

### Test coverage

De tests dekken:
- ✅ GET /api/state endpoint
- ✅ POST /api/add endpoint
- ✅ Input validatie
- ✅ Redis integratie (gemocked)

### Voeg eigen tests toe

Bewerk `server/tests/api.test.js` om nieuwe tests toe te voegen.

## 🎯 E2E Manual Testing

### Voorbereiding

1. Start server en Redis:
```bash
docker-compose up -d
```

2. Open twee browser vensters/tabs:
   - Tab 1: `http://localhost:5173`
   - Tab 2: `http://localhost:5173` (of andere computer op LAN)

### Test Scenario 1: Basic Flow

**Doel:** Verifieer dat acties realtime gesynchroniseerd worden.

1. **Tab 1:** Controleer connectie status → Moet "● Verbonden" tonen
2. **Tab 2:** Controleer connectie status → Moet "● Verbonden" tonen
3. **Tab 1:** Voeg loper "Alice" toe
   - ✅ "Alice" verschijnt in kolom "Aan het opwarmen"
   - ✅ Timer start met 00:00 en telt op
4. **Tab 2:** Verifieer binnen 200ms
   - ✅ "Alice" is zichtbaar
   - ✅ Timer loopt synchroon (max 1 seconde verschil)
5. **Tab 1:** Sleep "Alice" naar "In de wachtrij"
   - ✅ "Alice" verplaatst naar middelste kolom
   - ✅ Timer reset (of blijft doorlopen, afhankelijk van logica)
6. **Tab 2:** Verifieer binnen 200ms
   - ✅ "Alice" staat in "In de wachtrij"
7. **Tab 2:** Sleep "Alice" naar "Heeft gelopen"
   - ✅ "Alice" verplaatst naar rechter kolom
   - ✅ Timer stopt
   - ✅ Rood kruisje verschijnt
8. **Tab 1:** Verifieer binnen 200ms
   - ✅ "Alice" staat in "Heeft gelopen"
   - ✅ Timer toont gefixeerde tijd
9. **Tab 1:** Klik op rood kruisje
   - ✅ Bevestigingsdialoog verschijnt
   - ✅ Na bevestiging: "Alice" verdwijnt
10. **Tab 2:** Verifieer binnen 200ms
    - ✅ "Alice" is verwijderd

**Resultaat:** PASS als alle stappen binnen tijdslimiet slagen.

### Test Scenario 2: Multiple Users

**Doel:** Verifieer dat meerdere gebruikers simultaan kunnen werken.

1. **Tab 1:** Voeg "Bob" toe
2. **Tab 2:** Voeg tegelijkertijd "Charlie" toe
3. **Beide tabs:** Verifieer dat beide lopers zichtbaar zijn
4. **Tab 1:** Sleep "Bob" naar "In de wachtrij"
5. **Tab 2:** Sleep tegelijkertijd "Charlie" naar "In de wachtrij"
6. **Beide tabs:** Verifieer dat beide bewegingen gelukt zijn

**Verwacht gedrag:**
- ✅ Geen lopers raken verloren
- ✅ Geen duplicaten
- ✅ Alle state veranderingen zijn zichtbaar

### Test Scenario 3: Timer Accuracy

**Doel:** Verifieer dat timers server-authoritative zijn.

1. **Tab 1:** Voeg "David" toe
2. Wacht precies 60 seconden
3. **Tab 1:** Timer moet ~01:00 tonen
4. **Tab 2:** Timer moet ook ~01:00 tonen (max 1-2 sec verschil)
5. **Tab 1:** Refresh pagina (F5)
6. **Tab 1:** Timer moet nog steeds ~01:00+ tonen (geen reset)
7. **Tab 2:** Timer blijft doorlopen

**Resultaat:** PASS als timer niet reset na refresh.

### Test Scenario 4: Connection Resilience

**Doel:** Verifieer dat applicatie omgaat met disconnects.

1. **Tab 1:** Voeg "Eve" toe
2. **Server:** Stop server: `docker-compose stop server`
3. **Beide tabs:** Status moet veranderen naar "○ Niet verbonden"
4. **Tab 1:** Probeer "Frank" toe te voegen → Moet falen/pending
5. **Server:** Start server: `docker-compose start server`
6. **Beide tabs:** Status moet binnen 5-10 sec naar "● Verbonden"
7. **Beide tabs:** Controleer dat "Eve" nog steeds zichtbaar is
8. **Tab 1:** Voeg "Frank" toe → Moet nu werken

**Verwacht gedrag:**
- ✅ UI toont duidelijke verbindingsstatus
- ✅ Data blijft persistent (via Redis)
- ✅ Automatische reconnect werkt

### Test Scenario 5: Data Persistence

**Doel:** Verifieer Redis AOF persistence.

1. Voeg 3-5 lopers toe in verschillende kolommen
2. Stop ALLES: `docker-compose down`
3. Start opnieuw: `docker-compose up -d`
4. Open client
5. **Verifieer:**
   - ✅ Alle lopers zijn er nog
   - ✅ Correcte kolommen
   - ✅ Timers lopen verder vanaf juiste tijd

### Test Scenario 6: Concurrent Modifications

**Doel:** Test conflict handling.

1. **Tab 1:** Voeg "Grace" toe (kolom: warming)
2. **Beide tabs:** Verifieer "Grace" zichtbaar
3. **Tab 1:** Sleep "Grace" naar "queue" (maar LAAT MUISKNOP NIET LOS)
4. **Tab 2:** Sleep tegelijkertijd "Grace" naar "done"
5. **Tab 1:** Laat muisknop los
6. **Verifieer:**
   - ✅ Laatste actie wint (of error + resync)
   - ✅ Beide clients tonen dezelfde state
   - ✅ Geen "stuck" state

### Test Scenario 7: Edge Cases

**Test lange namen:**
```
Naam: "Zeer Lange Naam Met Heel Veel Karakters Die Misschien De UI Kapot Maakt"
```
- ✅ Naam wordt correct weergegeven (word-wrap)
- ✅ Card blijft leesbaar

**Test special characters:**
```
Naam: "Émilie O'Brien & José (test) 🏃"
```
- ✅ Geen crashes
- ✅ Tekens worden correct getoond

**Test lege naam:**
```
Naam: "   " (alleen spaties)
```
- ✅ Knop disabled of error message

**Test veel lopers:**
- Voeg 50+ lopers toe
- ✅ Performance blijft acceptabel
- ✅ Scrolling werkt
- ✅ Geen memory leaks

## 📊 Performance Benchmarks

### Latency Test

1. Open browser DevTools → Network tab
2. Voeg loper toe
3. Kijk naar Socket.IO messages
4. **Target:** <200ms tussen actie en broadcast

### Load Test

Gebruik deze simpele script om load te simuleren:

```javascript
// In browser console
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected');
  
  // Voeg 100 lopers toe
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      socket.emit('runner:add', { name: `Runner ${i}` });
    }, i * 100);
  }
});
```

**Verwacht:**
- ✅ Server blijft responsive
- ✅ Alle lopers verschijnen
- ✅ UI blijft smooth

## 🐛 Bug Reporting

Als je een bug vindt:

1. **Reproduceer:** Volg exacte stappen
2. **Log:** Check browser console + server logs
3. **Document:**
   - Wat deed je?
   - Wat verwachtte je?
   - Wat gebeurde er?
   - Screenshots/video indien mogelijk
4. **Environment:**
   - Browser + versie
   - OS
   - Docker of manual install?

## ✅ Test Checklist voor Releases

Voor elke release, test:

- [ ] Alle E2E scenarios hierboven
- [ ] Server unit tests: `npm test`
- [ ] Werkt op clean install (nieuwe VM/container)
- [ ] Werkt na server restart
- [ ] Werkt na Redis restart
- [ ] Timer accuracy binnen 2 seconden na 5 minuten
- [ ] Realtime sync <200ms
- [ ] Geen console errors
- [ ] Geen memory leaks na 1 uur gebruik
- [ ] Performance goed met 50+ lopers
- [ ] Werkt in Chrome, Firefox, Safari
- [ ] Mobile responsive (optioneel maar nice)

## 🔧 Automated Testing (Future)

Voor automated E2E tests, overweeg:
- Playwright of Cypress
- Test meerdere browser vensters simultaan
- Assert op realtime updates
- Performantie monitoring

Voorbeeld Playwright test structure:
```javascript
test('realtime sync between clients', async ({ page, context }) => {
  const page1 = page;
  const page2 = await context.newPage();
  
  await page1.goto('http://localhost:5173');
  await page2.goto('http://localhost:5173');
  
  // Voeg runner toe in page1
  await page1.fill('input', 'Alice');
  await page1.click('button:has-text("Toevoegen")');
  
  // Verifieer in page2 binnen 200ms
  await page2.waitForSelector('text=Alice', { timeout: 200 });
});
```