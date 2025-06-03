export function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Il browser non supporta le notifiche");
    return;
  }

  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

export function sendNotification(title: string, options: NotificationOptions = {}) {
  if (!("Notification" in window)) {
    console.log("Il browser non supporta le notifiche");
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options
    });

    return notification;
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          ...options
        });

        return notification;
      }
    });
  }
}

export function notifyEventUpdate(eventName: string, updateType: string, details: string) {
  sendNotification(`Aggiornamento: ${eventName}`, {
    body: `${updateType}: ${details}`,
    tag: `event-${eventName.replace(/\s+/g, '-').toLowerCase()}`
  });
}

export function notifyPaymentReceived(eventName: string, amount: number) {
  sendNotification(`Pagamento ricevuto: ${eventName}`, {
    body: `Hai ricevuto un pagamento di €${amount.toFixed(2)} per l'evento "${eventName}".`,
    tag: `payment-${eventName.replace(/\s+/g, '-').toLowerCase()}`
  });
}

export function notifyNewParticipant(eventName: string, participantName: string) {
  sendNotification(`Nuovo partecipante: ${eventName}`, {
    body: `${participantName} si è unito all'evento "${eventName}".`,
    tag: `participant-${eventName.replace(/\s+/g, '-').toLowerCase()}`
  });
}

export function notifyDateSelected(eventName: string, date: string) {
  sendNotification(`Data confermata: ${eventName}`, {
    body: `La data dell'evento "${eventName}" è stata confermata: ${date}.`,
    tag: `date-${eventName.replace(/\s+/g, '-').toLowerCase()}`
  });
}
