# MyFishingDiary

Aplikacija MyFishingDiary je spletna platforma za beleženje ribiških izletov. Ribičem omogoča objavo svojega izleta, komentiranje in pogovore na izletih drugih ribičev in povezovanje ribičev v ribiške skupine. Na določen izlet lahko tudi dodajo, katere ribo so na njem ujeli. Za večji občutek povezanosti, pa pod vsaki izletom prikažemo tudi izlete drugih ribičev v bljižini.

Aplikacija omogoča tudi naprednejše funkcionalnosti kot so:

- e-mail obveščanje ob registraciji
- zemljevid lokacije izleta
- komentiranje izletov
- iskanje izletov v okolici izbranega kraja

## Zaslonske maske

1. [Domača stran](/docs/index.html) je prva stran, ki jo obišče uporabnik ob vstopu v aplikacijo. Poleg začetnega pozdrava omogoča iskanje izletov glede na lokacijo (uporaba zunanjega vira za lokacije). Ob potrditvi iskanja pa nas aplikacija preusmeri na zaslonsko masko, katera je predstavljena v točki 2.

   **Funkcionalnosti:** - iskanje - zunanji vir (iskanje po naslovih)

2. [Stran z izleti](/docs/trips.html) nam omogoča prikaz vseh izletov, kateri so bili dodani s strani katerega koli uporabnika. Omogoča pa tudi prikaz izletov glede na iskano lokacijo in dodatnih filtrov, ki so na voljo nad tabelo z izleti. Prav tako na vrhu strani pa je tudi možnost za dodajanje izletov. Na koncu vsake vrstice z izleti pa je tudi možnost za ogled podrobnosti izleta in brisanja.

   **Funkcionalnosti:** - iskanje - izpis seznama in master/detail vzorec - dodajanje elementa - brisanje elementa

3. [Stran s podrobnostmi izleta](/docs/trip-details.html) omogoča pregled, urejanje in brisanje izleta. Poleg osnovnih podatkov, ki so na voljo že v tabeli na zaslonski maski s točke 2., je prikazana lokacija izleta še na zemljevidu in njegovi komentarji. Na komentarjih pa je omogočeno tudi dodajanje, urejanje in brisanje komentrajev.

   **Funkcionalnosti:** - pregled in urejanje elementa - brisanje elementa - zunanji vir (zemljevid) - dodajanje elementa

4. [Profilna stran](/docs/profile.html) nam prikazuje osnovne podatke prijavljenega uporabnika, spreminjanje njegovih podatkov in gesla. Prikazuje nam tudi vse njegove izlete.

   **Funkcionalnosti:** - izpis seznama in master/detail vzorec - urejanje elementa

5. [Stan z registracijo](/docs/register.html) ima obrazec za dodajanje novega uporabnika.

   **Funkcionalnosti:** - prijava/registracija uporabnika

## Uporabniške vloge

1. **Neprijavljen uporabnik**: Lahko išče po izletih, ribah, komentarjih in ribiških skupinah in pregleduje vse njihove podrobnosti.
2. **Prijavljen uporabnik**: Lahko išče po izletih, ribah, komentarjih in ribiških skupinah in pregleduje vse njihove podrobnosti. Lahko tudi dodaja izlete, ribe, ribiške skupine in dodaja komentarje. Spreminja in briše lahko le svoje izlete, ribe, ribiške skupine in komentarje.
3. **Administrator**: Lahko išče po izletih, ribah, komentarjih in ribiških skupinah in pregleduje vse njihove podrobnosti. Lahko tudi dodaja izlete, ribe, ribiške skupine in dodaja komentarje. Spreminja in briše lahko vse izlete, ribe, ribiške skupine in dodaja komentarje.

## Dodatne knjižnice uporabljene pri razvoju

1. **nodemailer**: Ob uspešni registraciji se pošlje mail, ki uporabnika pozdravi na platformo.
2. **node-geocoder**: S povezovanjem na google API omogoča pretvorbo naslova v koordinate.

## Dostop do produkcijske aplikacije

[https://my-fishing-diary.onrender.com/](https://my-fishing-diary.onrender.com/)

API swagger dokumentacija:
[https://my-fishing-diary.onrender.com/api/docs](https://my-fishing-diary.onrender.com/api/docs)

Admin uporabnik:

- **Email:** admin@admin.com
- **Password:** nimda

Navaden uporabnik:

- **Email:** user@user.com
- **Password:** resu

V navigaciji zgoraj in na poti `/db` se nahajata gumba za dodajanje začetnih podatkov in brisanje vseh podatkov.

Prezentacija: [https://docs.google.com/presentation/d/11R-q_OhDJdHAsnvnfbw6km5ctPiSHWt4ofZyW8hyvK0](https://docs.google.com/presentation/d/11R-q_OhDJdHAsnvnfbw6km5ctPiSHWt4ofZyW8hyvK0/edit?usp=sharing)

## Lokalen zagon aplikacije

### Konfiguracija (`env.js`):

1. Za zagon je potrebna konfiguracija v `.env` datoteki.

```javascript
JWT_SECRET = superSecretPassword;
MONGO_ATLAS_URI = "POT_DO_MONGO_ATLAS_URI";
EMAIL = "EMAIL_ZA_POSILJANJE_MAIL";
EMAIL_PASS = "APP_PASSWORD_ZA_MAIL";
GOOGLE_API_KEY = "GOOGLE_API_KEY";
```

2. Poženite `docker-compose up`
3. Aplikacija je na voljo v `http://localhost:3000/`

## Validacija uporabniških vnosov:

1. Email - prijava, registracija
2. Števila - koordinate

## Obvladovanje večje količine podatkov

- V tabeli na url /trips

## Lighthouse poročilo

Nahaja se v datoteki [Report](/lighthouse/report.html).
Dobljen rezultat je primerljiv s tistim, ki smo ga dobili na predavanjih, le da je performance malo nižji, saj sem aplikacijo testiral na slabšem računalniku in je bil load time malo počasnejši.

## OWASP ZAP poročilo

Oba poročila se nahajata v mapi [OWASP ZAP poročila](/test/security). Med prvim in drugim poročilom je kar veliko izboljšav a zaradi stiske s časom mi ni uspelo odpraviti vsega.

## Docker compose

The docker compose has 4 services: API, Front End, Data base and Reverse proxy. THe API and Front End are build using custom dockerfile, the DB and reverse proxy are built from images. The DB also has a volume for storing of data.

## CI CD

The CI CD is done with GitHub actions that builds the app and creates a tag.
