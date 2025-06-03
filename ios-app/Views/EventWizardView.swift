import SwiftUI
import Supabase

struct EventWizardView: View {
    @State private var step: Int = 1
    @State private var event = Event()
    @State private var newProposedDate = Date()
    @State private var newParticipant = ""

    var body: some View {
        NavigationView {
            VStack {
                if step == 1 {
                    StepOne
                } else if step == 2 {
                    StepTwo
                } else {
                    StepThree
                    Button("Salva") { saveEvent() }
                        .padding(.top)
                }
                Spacer()
                HStack {
                    if step > 1 { Button("Indietro") { step -= 1 } }
                    Spacer()
                    if step < 3 { Button("Avanti") { step += 1 } }
                }
                .padding()
            }
            .navigationTitle("Nuovo Evento")
        }
    }

    var StepOne: some View {
        Form {
            TextField("Nome", text: $event.name)
            TextField("Descrizione", text: $event.description)
        }
    }

    var StepTwo: some View {
        Form {
            Toggle("Seleziona data esistente", isOn: Binding(
                get: { event.selectedDate != nil },
                set: { useExisting in
                    if useExisting {
                        event.proposedDates.removeAll()
                    } else {
                        event.selectedDate = nil
                    }
                }))
            if event.selectedDate != nil {
                DatePicker("Data evento", selection: Binding(
                    get: { event.selectedDate ?? Date() },
                    set: { event.selectedDate = $0 }
                ), displayedComponents: .date)
            } else {
                DatePicker("Proponi una data", selection: $newProposedDate, displayedComponents: .date)
                Button("Aggiungi data") {
                    event.proposedDates.append(newProposedDate)
                }
                if !event.proposedDates.isEmpty {
                    Text("Date proposte:")
                    ForEach(event.proposedDates, id: \.self) { date in
                        Text(date, style: .date)
                    }
                }
            }
        }
    }

    var StepThree: some View {
        Form {
            HStack {
                TextField("Partecipante", text: $newParticipant)
                Button("Aggiungi") {
                    event.payments.append(Payment(participant: newParticipant, paid: false))
                    newParticipant = ""
                }
            }
            if !event.payments.isEmpty {
                Section(header: Text("Pagamenti")) {
                    ForEach($event.payments) { $payment in
                        Toggle(payment.participant, isOn: $payment.paid)
                    }
                }
            }
        }
    }

    private func saveEvent() {
        Task {
            do {
                _ = try await supabase.from("events").insert(event).execute()
            } catch {
                debugPrint(error)
            }
        }
    }
}

struct EventWizardView_Previews: PreviewProvider {
    static var previews: some View {
        EventWizardView()
    }
}
