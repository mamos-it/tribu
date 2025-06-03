import Foundation

struct Event: Codable {
    var name: String = ""
    var description: String = ""
    var selectedDate: Date?
    var proposedDates: [Date] = []
    var payments: [Payment] = []
}

struct Payment: Identifiable, Codable {
    let id: UUID = UUID()
    var participant: String
    var paid: Bool
}
