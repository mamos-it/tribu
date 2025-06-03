import Foundation

struct Event {
    var name: String = ""
    var description: String = ""
    var selectedDate: Date?
    var proposedDates: [Date] = []
    var payments: [Payment] = []
}

struct Payment: Identifiable {
    let id = UUID()
    var participant: String
    var paid: Bool
}
