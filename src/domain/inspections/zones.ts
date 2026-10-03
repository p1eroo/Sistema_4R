export enum DamageView {
  Front = "front",
  Rear = "rear",
  Left = "left",
  Right = "right",
  Roof = "roof",
}

export const DAMAGE_VIEW_LABELS: Record<DamageView, string> = {
  [DamageView.Front]: "Frente",
  [DamageView.Rear]: "Posterior",
  [DamageView.Left]: "Lateral izquierdo",
  [DamageView.Right]: "Lateral derecho",
  [DamageView.Roof]: "Techo",
};

export const DAMAGE_ZONES = [
  {
    id: "front-windshield",
    view: DamageView.Front,
    label: "Parabrisas",
    x: 50,
    y: 18,
  },
  { id: "front-hood", view: DamageView.Front, label: "Capó", x: 50, y: 40 },
  {
    id: "front-headlight-left",
    view: DamageView.Front,
    label: "Faro izquierdo",
    x: 24,
    y: 64,
  },
  {
    id: "front-headlight-right",
    view: DamageView.Front,
    label: "Faro derecho",
    x: 76,
    y: 64,
  },
  {
    id: "front-grille",
    view: DamageView.Front,
    label: "Parrilla",
    x: 50,
    y: 66,
  },
  {
    id: "front-bumper",
    view: DamageView.Front,
    label: "Parachoques delantero",
    x: 50,
    y: 86,
  },

  {
    id: "rear-window",
    view: DamageView.Rear,
    label: "Luna posterior",
    x: 50,
    y: 18,
  },
  { id: "rear-trunk", view: DamageView.Rear, label: "Maletera", x: 50, y: 42 },
  {
    id: "rear-taillight-left",
    view: DamageView.Rear,
    label: "Faro posterior izquierdo",
    x: 24,
    y: 64,
  },
  {
    id: "rear-taillight-right",
    view: DamageView.Rear,
    label: "Faro posterior derecho",
    x: 76,
    y: 64,
  },
  {
    id: "rear-bumper",
    view: DamageView.Rear,
    label: "Parachoques posterior",
    x: 50,
    y: 86,
  },

  {
    id: "left-mirror",
    view: DamageView.Left,
    label: "Espejo lateral",
    x: 14,
    y: 26,
  },
  {
    id: "left-front-fender",
    view: DamageView.Left,
    label: "Guardafango delantero",
    x: 22,
    y: 42,
  },
  {
    id: "left-front-door",
    view: DamageView.Left,
    label: "Puerta delantera",
    x: 42,
    y: 48,
  },
  {
    id: "left-rear-door",
    view: DamageView.Left,
    label: "Puerta trasera",
    x: 64,
    y: 48,
  },
  {
    id: "left-rear-fender",
    view: DamageView.Left,
    label: "Guardafango trasero",
    x: 84,
    y: 42,
  },

  {
    id: "right-mirror",
    view: DamageView.Right,
    label: "Espejo lateral",
    x: 14,
    y: 26,
  },
  {
    id: "right-front-fender",
    view: DamageView.Right,
    label: "Guardafango delantero",
    x: 22,
    y: 42,
  },
  {
    id: "right-front-door",
    view: DamageView.Right,
    label: "Puerta delantera",
    x: 42,
    y: 48,
  },
  {
    id: "right-rear-door",
    view: DamageView.Right,
    label: "Puerta trasera",
    x: 64,
    y: 48,
  },
  {
    id: "right-rear-fender",
    view: DamageView.Right,
    label: "Guardafango trasero",
    x: 84,
    y: 42,
  },

  { id: "roof-panel", view: DamageView.Roof, label: "Techo", x: 50, y: 50 },
] as const;

export type DamageZone = (typeof DAMAGE_ZONES)[number];

export type DamageZoneId = DamageZone["id"];

export function zonesForView(view: DamageView): readonly DamageZone[] {
  return DAMAGE_ZONES.filter((zone) => zone.view === view);
}

export function findDamageZone(id: DamageZoneId): DamageZone | undefined {
  return DAMAGE_ZONES.find((zone) => zone.id === id);
}
