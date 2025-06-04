# Tribu Event Manager for iOS

Questo è un semplice progetto di esempio scritto in **SwiftUI** che dimostra un wizard per la creazione di nuovi eventi.

Per provarlo:

1. Apri la cartella `ios-app` in Xcode (15 o superiore).
2. Esegui l'app su un simulatore iOS.

Il wizard guida l'utente attraverso i seguenti passaggi:

1. Inserimento del nome e della descrizione dell'evento.
2. Scelta di una data esistente oppure creazione di una campagna di votazione per decidere la data.
3. Gestione dei pagamenti dei partecipanti.

Il codice è un prototipo semplificato e può essere esteso con logica più avanzata per votazioni, sincronizzazione remota e pagamenti.

## Aspetto minimale

L'interfaccia utilizza i componenti standard di SwiftUI (`NavigationView`, `Form`, `Toggle`) mantenendo un look essenziale.
Puoi personalizzare colori o font applicando i modifier di SwiftUI per restare fedele a questa semplicità.

## Integrazione Supabase

Aggiungi il package `supabase-swift` tramite Swift Package Manager usando:

```
https://github.com/supabase/supabase-swift
```

Le credenziali di esempio si trovano nel file `Supabase.swift` e permettono di salvare gli eventi nella tabella `events` e di recuperare i `todos` mostrati in `ContentView.swift`.
