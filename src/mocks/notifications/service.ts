export type AppNotification = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly href: string;
  readonly createdAt: string;
};

const seed: AppNotification[] = [
  {
    id: "NTF-0001",
    title: "Stock crítico",
    body: "Pastillas de freno delanteras: quedan 2 unidades.",
    href: "/inventario/critico",
    createdAt: "2026-02-26T08:15:00.000Z",
  },
  {
    id: "NTF-0002",
    title: "OT-2026-0184",
    body: "Lista para control de calidad.",
    href: "/taller/ordenes/WO-2026-0184",
    createdAt: "2026-02-26T09:40:00.000Z",
  },
];

export type NotificationService = {
  list(): Promise<readonly AppNotification[]>;
};

export function createNotificationService(
  initial: readonly AppNotification[] = seed,
): NotificationService {
  return {
    async list() {
      return [...initial];
    },
  };
}

export const notificationService: NotificationService =
  createNotificationService();
